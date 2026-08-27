import { FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.preview' });

async function run() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('Please set MNEMONIC in your .env.preview file.');
    process.exit(1);
  }

  // Polyfill window and crypto for headless Node.js execution
  if (!globalThis.crypto) {
    (globalThis as any).crypto = (await import('crypto')).webcrypto;
  }
  (global as any).window = {
    location: { origin: 'http://localhost:5173' },
    fetch: globalThis.fetch,
    crypto: globalThis.crypto
  };

  const envConfig = {
    walletNetworkId: 'preview',
    networkId: 'preview',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    nodeWS: 'wss://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300'
  } as any;

  const built = await FluentWalletBuilder.forEnvironment(envConfig)
    .withMnemonic(mnemonic)
    .build();

  const wallet = built.wallet;
  
  // Wait for the wallet to synchronize
  console.log('Wallet synchronized. Generating DUST from preview Faucet...');

  const unshieldedAddress = await built.keystore.deriveAddress(0);
  console.log('Unshielded Address:', unshieldedAddress);
  
  const state = await Rx.firstValueFrom(wallet.state());
  const balance = state.unshielded.localState.balances;
  console.log('Current balances:', balance);
  
  try {
    const res = await fetch(`https://faucet.preview.midnight.network/api/faucet/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: unshieldedAddress })
    });
    console.log('Successfully requested DUST generation from Faucet! Status:', res.status);
  } catch (err) {
    console.error('Failed to request DUST:', err);
  }

  process.exit(0);
}

run().catch(console.error);

