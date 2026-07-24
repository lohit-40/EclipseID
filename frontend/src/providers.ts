import { type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import type { CoinPublicKey } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger-v8';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';

import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
class DAppConnectorWalletAdapter implements MidnightProvider, WalletProvider {
  private readonly api: WalletConnectedAPI;
  private readonly coinPublicKey: string;
  private readonly encPublicKey: string;

  constructor(
    api: WalletConnectedAPI,
    coinPublicKey: string,
    encPublicKey: string
  ) {
    this.api = api;
    this.coinPublicKey = coinPublicKey;
    this.encPublicKey = encPublicKey;
  }

  getCoinPublicKey(): any {
    return typeof this.coinPublicKey === 'string' ? this.coinPublicKey : toHex(new Uint8Array(Object.values(this.coinPublicKey as any)));
  }

  getEncryptionPublicKey(): any {
    return typeof this.encPublicKey === 'string' ? this.encPublicKey : toHex(new Uint8Array(Object.values(this.encPublicKey as any)));
  }

  async balanceTx(tx: UnboundTransaction, ttl?: Date): Promise<Transaction> {
    const txHex = toHex((tx as unknown as Transaction<any, any, any>).serialize());
    console.log('Sending tx to DApp connector to balance...');
    const result = await this.api.balanceUnsealedTransaction(txHex, { payFees: true });
    console.log('DApp connector balance result received!');
    
    // Handle different possible return formats from Lace extension
    let txString: string;
    if (typeof result === 'string') {
      txString = result;
    } else if (result && typeof result.tx === 'string') {
      txString = result.tx;
    } else if (result instanceof Uint8Array) {
      txString = toHex(result);
    } else {
      throw new Error(`Unexpected return from balanceUnsealedTransaction: ${JSON.stringify(result)}`);
    }

    return Transaction.deserialize(
      'signature',
      'proof',
      'binding',
      fromHex(txString)
    ) as unknown as Transaction;
  }

  async submitTx(tx: Transaction): Promise<any> {
    const txHex = toHex((tx as unknown as Transaction<any, any, any>).serialize());
    console.log('Submitting tx to DApp connector...');
    let result;
    try {
      result = await this.api.submitTransaction(txHex);
    } catch (err: any) {
      console.error('LACE SUBMIT ERROR FULL:', err);
      if (err && err.cause) {
        console.error('Lace submit error cause:', JSON.stringify(err.cause, null, 2));
      }
      throw err;
    }
    console.log('DApp connector submitTransaction result:', result);
    
    if (typeof result === 'string') return result;
    if (result && typeof result.txHash === 'string') return result.txHash;
    
    // If the DApp connector didn't return the transaction ID, we can compute it from the transaction itself
    const computedHash = (tx as any).transactionHash();
    console.log('COMPUTED TX HASH:', computedHash);
    return computedHash;
  }
}

export const createMidnightProviders = async (
  api: WalletConnectedAPI,
  config: { indexer: string; indexerWS: string; prover?: string }
): Promise<MidnightProviders<any, any>> => {
  const shieldedAddrObj = await api.getShieldedAddresses();
  const walletAdapter = new DAppConnectorWalletAdapter(
    api,
    shieldedAddrObj.shieldedCoinPublicKey,
    shieldedAddrObj.shieldedEncryptionPublicKey
  );
  
  const unshieldedAddrObj = await api.getUnshieldedAddress();

  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  
  const originalProofProvider = httpClientProofProvider('http://127.0.0.1:6300');
  
    const originalPublicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);
    return {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'eclipse-id-private-state',
        privateStoragePasswordProvider: async () => 'Str0ngP@ssw0rd_M1dn1ght!2026_SecureKey',
        accountId: unshieldedAddrObj.unshieldedAddress
      }),
      publicDataProvider: originalPublicDataProvider,
      zkConfigProvider,
    proofProvider: {
      proveTx: async (tx: any) => {
        console.log('Sending tx to DApp connector to prove...');
        const result = await originalProofProvider.proveTx(tx);
        console.log('DApp connector prove result received!');
        return result;
      }
    } as any,
    walletProvider: walletAdapter,
    midnightProvider: walletAdapter,
  };
};
