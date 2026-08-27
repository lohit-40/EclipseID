import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import pino from 'pino';
import { getConfig } from './config.js';
import { MidnightWalletProvider, syncWallet, type WalletSecret } from './wallet.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.preview' });
process.env.MIDNIGHT_NETWORK = 'preview';

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

async function main() {
    const config = getConfig();
    setNetworkId(config.networkId);
    
    const seedPhrase = process.env.SEED;
    let secret: WalletSecret;
    if (/^[0-9a-fA-F]{64}$/.test(seedPhrase!)) {
        secret = { kind: 'seed', value: seedPhrase! };
    } else {
        secret = { kind: 'mnemonic', value: seedPhrase!.trim().replace(/\s+/g, ' ') };
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
    
    const wallet = await MidnightWalletProvider.build(logger, envConfig, secret);
    await wallet.start();
    const state = await syncWallet(logger, wallet.wallet, 3600000);
    const unshieldedAddr = await wallet.unshieldedKeystore.deriveAddress(0);
    console.log("==========================================");
    console.log("WALLET ADDRESS (for receiving funds):");
    console.log(unshieldedAddr);
    console.log("==========================================");

    console.log("WALLET STATE BALANCES:");
    console.log("Unshielded:", JSON.stringify(state.unshielded.localState.balances, null, 2));
    console.log("Shielded:", JSON.stringify(state.shielded.state.balances, null, 2));
    console.log("Dust:", JSON.stringify(state.dust.state.balance, null, 2));
    
    await wallet.stop();
}

main().catch(console.error);

