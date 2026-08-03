import { FaucetClient } from '@midnight-ntwrk/wallet-sdk-facade';
import { FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
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

  const unshieldedAddress = await wallet.unshieldedAddress();
  console.log('Unshielded Address:', unshieldedAddress);
  
  const state = await wallet.state();
  const balance = state.balances.unshielded;
  console.log('Current tNIGHT balance:', balance.toString());
  
  try {
    const faucet = new FaucetClient('https://faucet.preview.midnight.network');
    await faucet.requestFunds(unshieldedAddress);
    console.log('Successfully requested DUST generation from Faucet!');
  } catch (err) {
    console.error('Failed to request DUST:', err);
  }

  process.exit(0);
}

run().catch(console.error);

