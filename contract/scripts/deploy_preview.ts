import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { getConfig } from './config.js';
import { MidnightWalletProvider, type WalletSecret } from './wallet.js';
import { buildProviders, type EclipseIDProviders } from './providers.js';
import { Contract } from '../managed/contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as dotenv from 'dotenv';
import path from 'path';
import * as Rx from 'rxjs';
import type { FacadeState } from '@midnight-ntwrk/wallet-sdk';

dotenv.config({ path: '.env.preview' });
process.env.MIDNIGHT_NETWORK = 'preview';

const logger = pino({ level: 'debug', transport: { target: 'pino-pretty' } });
const PRIVATE_STATE_ID = 'EclipseIDPrivateState';

async function main() {
    console.log("==========================================");
    console.log("   Deploying EclipseID to preview...      ");
    console.log("==========================================");

    const config = getConfig();
    setNetworkId(config.networkId);

    const seedPhrase = process.env.SEED;
    if (!seedPhrase) {
        throw new Error("Please configure SEED in .env.preview with either a 64-char hex or a 24-word mnemonic");
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

    // ponytail: Wait for unshielded + dust sync. Shielded sync skipped — not needed for deployment.
    // DUST sync still needs ~255k blocks but is faster than shielded. Upgrade path: persistent wallet state.
    logger.info("Waiting for unshielded + dust wallet sync (shielded skipped for deployment)...");
    let emissionCount = 0;
    const syncStart = Date.now();
    await Rx.firstValueFrom(
        wallet.wallet.state().pipe(
            Rx.tap((state: FacadeState) => {
                emissionCount++;
                const unshieldedDone = (state.unshielded?.progress as any)?.isStrictlyComplete?.() ?? false;
                const dustDone = (state.dust?.state?.progress as any)?.isStrictlyComplete?.() ?? false;
                if (emissionCount % 2000 === 0) {
                    const elapsed = Math.round((Date.now() - syncStart) / 1000);
                    const dustProgress = state.dust?.state?.progress as any;
                    const applied = dustProgress?.appliedIndex ?? '?';
                    const target = dustProgress?.highestRelevantWalletIndex ?? '?';
                    logger.info(`Sync [${emissionCount}] ${elapsed}s: unshielded=${unshieldedDone}, dust=${dustDone} (${applied}/${target})`);
                }
            }),
            Rx.filter((state: FacadeState) => {
                const unshieldedDone = (state.unshielded?.progress as any)?.isStrictlyComplete?.() ?? false;
                const dustDone = (state.dust?.state?.progress as any)?.isStrictlyComplete?.() ?? false;
                return unshieldedDone && dustDone;
            }),
            Rx.timeout({ each: 7_200_000, with: () => Rx.throwError(() => new Error('Wallet sync timeout (2hr)')) }),
        ),
    );
    logger.info(`Wallet synced (unshielded+dust) after ${emissionCount} emissions, ${Math.round((Date.now() - syncStart) / 1000)}s`);

    // waitForFunds skipped — its internal syncWallet also requires full sync and times out.
    // DUST is already available after the sync above completes.

    const zkConfigPath = path.resolve(process.cwd(), 'managed');
    const providers = buildProviders(wallet, zkConfigPath, config);

    const dummyWitnesses = {
        user_credential: (context: any) => [context.currentPrivateState, { secret_id: 0n, issuer_pk: new Uint8Array(32), is_accredited: false, age: 0n }],
        msgSender: (context: any) => [context.currentPrivateState, new Uint8Array(32)]
    };

    logger.info("Wallet synced. Reading compiled contract...");
    const compiledContract = CompiledContract.make(
        'EclipseIdContract',
        Contract
    ).pipe(
        CompiledContract.withWitnesses(dummyWitnesses),
        CompiledContract.withCompiledFileAssets(zkConfigPath)
    );

    logger.info("Deploying Contract...");
    const ownerKeys = wallet.getCoinPublicKey();
    const deployed = await deployContract(providers, {
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
        compiledContract: compiledContract,
        args: [Buffer.from(ownerKeys, 'hex')]
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

