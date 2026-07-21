import { createRequire } from 'module';
import { DAppConnectorWalletAdapter, createLogger, PreprodTestEnvironment, FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import { createMidnightProviders } from './src/providers.js';
import { Contract } from './src/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.preprod' });

async function run() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (typeof input === 'string' && input.includes('/graphql') && init?.body) {
      try {
        const body = JSON.parse(init.body as string);
        let offsetIsEmpty = false;
        if (body.variables && body.variables.offset !== undefined) {
          if (body.variables.offset === null || Object.keys(body.variables.offset).length === 0) {
            offsetIsEmpty = true;
            delete body.variables.offset;
          }
        }
        if (offsetIsEmpty && typeof body.query === 'string') {
          body.query = body.query.replace(/,\s*\$offset:\s*[A-Za-z0-9_!]+/g, '');
          body.query = body.query.replace(/\(\$offset:\s*[A-Za-z0-9_!]+\)/g, '');
          body.query = body.query.replace(/,\s*offset:\s*\$offset/g, '');
          body.query = body.query.replace(/\(offset:\s*\$offset\)/g, '');
        }
        init.body = JSON.stringify(body);
      } catch (e) {}
    }
    return originalFetch(input, init);
  };

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('Please set MNEMONIC="your 24 word seed phrase" in your .env.preprod file.');
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

  setNetworkId('preprod');

  console.log('Initializing headless wallet adapter...');
  
  const envConfig = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300'
  } as any;
  
  const logger = createLogger('test-e2e');
  const seeds = (await import('@midnight-ntwrk/testkit-js')).WalletSeeds.fromMnemonic(mnemonic);
  const midnightWalletProvider = await (await import('@midnight-ntwrk/testkit-js')).MidnightWalletProvider.build(logger, envConfig, seeds.masterSeed);
  
  await midnightWalletProvider.start(false);

  console.log('Wallet connected. Waiting for sync...');
  // Wait for the wallet to synchronize
  let emissionCount = 0;
  await (await import('rxjs')).firstValueFrom(
    midnightWalletProvider.wallet.state().pipe(
      (await import('rxjs')).tap((s: any) => {
        emissionCount++;
        const sP = s.shielded?.state?.progress;
        const uP = s.unshielded?.progress;
        const dP = s.dust?.state?.progress;
        const sSync = sP && typeof sP.isStrictlyComplete === 'function' ? sP.isStrictlyComplete() : false;
        const uSync = uP && typeof uP.isStrictlyComplete === 'function' ? uP.isStrictlyComplete() : false;
        const dSync = dP && typeof dP.isStrictlyComplete === 'function' ? dP.isStrictlyComplete() : false;
        console.log(`Wallet sync [${emissionCount}]: shielded=${sSync}, unshielded=${uSync}, dust=${dSync}`);
      }),
      (await import('rxjs')).filter((s: any) => {
        const sP = s.shielded?.state?.progress;
        const uP = s.unshielded?.progress;
        const sSync = sP && typeof sP.isStrictlyComplete === 'function' ? sP.isStrictlyComplete() : false;
        const uSync = uP && typeof uP.isStrictlyComplete === 'function' ? uP.isStrictlyComplete() : false;
        // Ignore dust for now since it hangs on preprod
        return sSync && uSync;
      })
    )
  );

  console.log('Wallet Synced!');

  console.log('Setting up providers...');

  console.log('Wallet connected. Setting up providers...');
  const { DAppConnectorWalletAdapter } = await import('@midnight-ntwrk/testkit-js');
  const walletConnectedAPI = new DAppConnectorWalletAdapter(midnightWalletProvider, envConfig);
  
  const providers = await createMidnightProviders(walletConnectedAPI as any, {
    indexer: envConfig.indexer,
    indexerWS: envConfig.indexerWS,
  });

  console.log('Checking wallet balances...');
  const dustBalance = await walletConnectedAPI.getDustBalance();
  if (dustBalance.balance === 0n) {
    const { dustAddress } = await walletConnectedAPI.getDustAddress();
    console.error(`\n❌ INSUFFICIENT FUNDS: Test wallet does not have any tDUST.`);
    console.error(`Please fund this DUST address via the Midnight faucet (https://faucet.midnight.network):`);
    console.error(`DUST Address: ${dustAddress}\n`);
    process.exit(1);
  }

  console.log('Deploying contract...');
  const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(
    CompiledContract.withVacantWitnesses
  );

  const deployed = await deployContract(providers, {
    compiledContract,
  });

  const addr = deployed.deployTxData.public.contractAddress;
  console.log(`\n✅ Contract deployed successfully!`);
  console.log(`Contract Address: ${addr}`);
  
  // Example of calling add_issuer
  // const issuerBytes = fromHex('1111111111111111111111111111111111111111111111111111111111111111');
  // console.log('Adding issuer...');
  // const { txHash } = await deployed.callTx.add_issuer(issuerBytes);
  // console.log(`Issuer added! TxHash: ${txHash}`);
}

run().catch(err => {
  console.error('\n❌ Error during test:');
  console.error(err);
  process.exit(1);
});
