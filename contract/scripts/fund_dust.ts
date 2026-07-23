import { FaucetClient } from '@midnight-ntwrk/wallet-sdk-facade';
import { FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.preprod' });

async function run() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('Please set MNEMONIC in your .env.preprod file.');
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
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300'
  } as any;

  const built = await FluentWalletBuilder.forEnvironment(envConfig)
    .withMnemonic(mnemonic)
    .build();

  const wallet = built.wallet;
  
  // Wait for the wallet to synchronize
  console.log('Wallet synchronized. Generating DUST from Preprod Faucet...');

  const unshieldedAddress = await wallet.unshieldedAddress();
  console.log('Unshielded Address:', unshieldedAddress);
  
  const state = await wallet.state();
  const balance = state.balances.unshielded;
  console.log('Current tNIGHT balance:', balance.toString());
  
  try {
    const faucet = new FaucetClient('https://faucet.preprod.midnight.network');
    await faucet.requestFunds(unshieldedAddress);
    console.log('Successfully requested DUST generation from Faucet!');
  } catch (err) {
    console.error('Failed to request DUST:', err);
  }

  process.exit(0);
}

run().catch(console.error);
