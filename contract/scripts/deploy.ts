import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { getConfig } from './config.js';
import { MidnightWalletProvider, syncWallet, type WalletSecret } from './wallet.js';
import { buildProviders, type EclipseIDProviders } from './providers.js';
import { Contract } from '../managed/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { waitForFunds } from '@midnight-ntwrk/testkit-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.preview' });
process.env.MIDNIGHT_NETWORK = 'preview';

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const PRIVATE_STATE_ID = 'EclipseIDPrivateState';

async function main() {
    console.log("==========================================");
    console.log("   Deploying EclipseID to Preview...      ");
    console.log("==========================================");

    const config = getConfig();
    setNetworkId(config.networkId);

    const seedPhrase = process.env.SEED;
    if (!seedPhrase) {
        throw new Error("Please configure SEED in .env.preprod with either a 64-char hex or a 24-word mnemonic");
    }

    let secret: WalletSecret;
    if (/^[0-9a-fA-F]{64}$/.test(seedPhrase)) {
        secret = { kind: 'seed', value: seedPhrase };
    } else {
        secret = { kind: 'mnemonic', value: seedPhrase.trim().replace(/\s+/g, ' ') };
    }

    const envConfig = {
        walletNetworkId: config.networkId,
        networkId: config.networkId,
        indexer: config.indexer,
        indexerWS: config.indexerWS,
        node: config.node,
        nodeWS: config.nodeWS,
        faucet: config.faucet,
        proofServer: config.proofServer,
    };

    logger.info("Building Wallet Provider...");
    const wallet = await MidnightWalletProvider.build(logger, envConfig, secret);
    await wallet.start();
    await syncWallet(logger, wallet.wallet, 600000); // 10m timeout

    logger.info("Auto-registering NIGHT into DUST if needed (this might take a few seconds)...");
    const nightBalance = await waitForFunds(
        wallet.wallet,
        envConfig,
        false,
        wallet.unshieldedKeystore,
    );
    logger.info(`NIGHT balance: ${nightBalance}`);

    const zkConfigPath = path.resolve(process.cwd(), 'managed');
    const providers = buildProviders(wallet, zkConfigPath, config);

    logger.info("Wallet synced. Reading compiled contract...");
    const compiledContract = CompiledContract.make(
        'EclipseIdContract',
        Contract
    ).pipe(
        CompiledContract.withVacantWitnesses,
        CompiledContract.withCompiledFileAssets(zkConfigPath)
    );

    logger.info("Deploying Contract...");
    const deployed = await deployContract(providers, {
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
        compiledContract: compiledContract,
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    
    console.log("\n==========================================");
    console.log("✅ CONTRACT DEPLOYMENT SUCCESSFUL! ✅");
    console.log(`Address: ${contractAddress}`);
    console.log("==========================================\n");

    logger.info("Stopping wallet...");
    await wallet.stop();
}

main().catch((err) => {
    console.error("Deployment Failed:", err);
    process.exit(1);
});
