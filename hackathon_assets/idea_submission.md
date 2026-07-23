# Idea Submission Draft

**Category:** `Identity/credentials`

---

### What is your idea?

We built EclipseID because dealing with KYC and identity on public blockchains right now is honestly terrible. If a user wants to interact with a dApp that requires them to be over 18 or an accredited investor, they usually have to hand over their ID to a centralized provider and permanently link their wallet to their real-world identity on a public ledger. It completely ruins the point of web3 privacy. 

Our idea is EclipseID: a zero-knowledge identity provider built natively for the Midnight Network. It acts as a shield between KYC providers and dApps. Instead of handing over raw data, users can just generate a ZK-proof that they meet a dApp's requirements (like "is_accredited = true") without ever exposing who they actually are.

**Why Midnight needs this**
Midnight is great at providing the base layer for privacy-preserving smart contracts. But if we want a real ecosystem of Confidential DeFi to take off, developers shouldn't have to build their own complex ZK-identity onboarding flows from scratch every single time. EclipseID fills this gap by giving the network a plug-and-play credential layer. It lets dApps stay compliant without taking on the massive liability of storing user data.

**How it's actually useful**
The use cases are pretty massive. It unlocks Compliant Confidential DeFi—meaning institutional dark pools or private DEXs can verify accredited investors without storing their PII. It also fixes DAO voting by proving "Unique Humanity" without linking a voter's real identity to their on-chain votes (stopping Sybil attacks privately). Even simple things like age-gating consumer dApps become secure and private.

**How we built it**
We used the full Midnight stack to put this together. 
The core of it is a Compact smart contract that handles the `verify_and_claim` circuit. We designed it so the public ledger only stores the authorized issuers, while all the sensitive user data stays completely off-chain on the user's local machine. 

When a user connects, the Compact circuit runs locally to prove their hidden identity data satisfies the dApp's rules. Only the proof (and a nullifier to stop replay attacks) gets sent to the chain. To make it actually usable, we integrated the `@midnight-ntwrk/dapp-connector-api` on the frontend, so users just connect their Lace wallet and click a button. The heavy ZK proof generation happens quietly in the background behind a really clean UI.
