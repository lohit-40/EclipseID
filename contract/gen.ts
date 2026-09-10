import { FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import { PREPROD_CONFIG } from './scripts/config.js';
async function run() {
  const built = await FluentWalletBuilder.forEnvironment(PREPROD_CONFIG as any).withRandomSeed().buildWithoutStarting();
  console.log(await built.keystore.deriveAddress(0));
}
run();
