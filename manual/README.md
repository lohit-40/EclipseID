# EclipseID Manual & Evidence

This directory contains the required manual documentation and test evidence for the Midnight Hackathon Level 4/5 evaluation. 

## Contract Verification (Step 1)
The smart contract `EclipseID.compact` has been included in this directory so the reviewer can easily assess the **product-specific privacy design**.

- **Privacy Design**: The contract uses the `UserAttributes` as a private `witness`, enforcing that the user's secret identity, age, and issuer signature remain off-chain in the shielded vault. The ZK Circuits (`enter_darkpool` and `claim_age_gated_airdrop`) selectively disclose only the boolean result (e.g. `age >= 18`), while generating a zero-knowledge proof. A `nullifier` is published to the ledger to prevent replay attacks without linking back to the user's credential.

## Test Evidence (Step 5)
The test evidence output confirming the successful compilation of the contract, generation of the ZK IR, and verification of the application logic is provided in `test-evidence.txt`.
