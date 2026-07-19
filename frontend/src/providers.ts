import { type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { type MidnightProvider, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { type UnboundTransaction, type FinalizedTransaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

class DAppConnectorWalletAdapter implements MidnightProvider, WalletProvider {
  // Dummy keys since we are delegating signing and balancing entirely to Lace
  private dummyKey = new Uint8Array(32);

  constructor(private readonly api: WalletConnectedAPI) {}

  getCoinPublicKey(): any {
    return this.dummyKey;
  }

  getEncryptionPublicKey(): any {
    return this.dummyKey;
  }

  async balanceTx(tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> {
    const txHex = toHex(tx.serialize());
    const result = await this.api.balanceUnsealedTransaction(txHex, { payFees: true });
    // We cast the hex string to FinalizedTransaction to bypass TypeScript,
    // since midnight-js-contracts will just pass this directly to our submitTx.
    return result.tx as unknown as FinalizedTransaction;
  }

  async submitTx(tx: FinalizedTransaction): Promise<any> {
    // tx is actually the hex string returned from balanceTx
    const txHex = tx as unknown as string;
    await this.api.submitTransaction(txHex);
    // Return dummy hash since submitTransaction doesn't return one
    return '0'.repeat(64);
  }
}

export const createMidnightProviders = async (
  api: WalletConnectedAPI,
  config: { indexer: string; indexerWS: string; prover?: string }
): Promise<MidnightProviders<any, any>> => {
  const walletAdapter = new DAppConnectorWalletAdapter(api);

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'eclipse-id-private-state'
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider: new FetchZkConfigProvider(window.location.origin, fetch.bind(window)),
    proofProvider: await dappConnectorProofProvider(api, new FetchZkConfigProvider(window.location.origin, fetch.bind(window))),
    walletProvider: walletAdapter,
    midnightProvider: walletAdapter,
  };
};
