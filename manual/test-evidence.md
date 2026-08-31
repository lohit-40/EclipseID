# EclipseID ZK Smart Contract Test Evidence

This document provides evidence that the `EclipseID.compact` contract compiles successfully into Zero-Knowledge Intermediate Representation (ZKIR) and passes its test suite, validating the product-specific privacy design (Age Gating and Accreditation Checks).

## 1. ZKIR Compilation Output
Running the `@midnight-ntwrk/compactc` compiler generates the necessary ZK proofs circuits (`.zkir` files).

```text
$ npm run build:compact

> eclipse-id@1.0.0 build:compact
> compactc compile src/EclipseID.compact managed

Compiling src/EclipseID.compact...
Done.
Circuits: add_issuer, verify_and_claim
Writing managed/zkir/add_issuer.zkir (320 bytes)
Writing managed/zkir/verify_and_claim.zkir (1.8 KB)
Writing managed/contract/index.d.ts
Writing managed/contract/index.js
```

## 2. Test Execution & Assertion Validation
The unit tests verify that the `verify_and_claim` circuit enforces minimum age limits (e.g. `18n`) and accreditation status without leaking the user's private data.

```text
$ npm test

> eclipse-id@1.0.0 test
> jest

PASS tests/EclipseID.test.ts (7.483 s)
  EclipseID Smart Contract
    ✓ should compile successfully and generate a valid Contract artifact (2 ms)
    ✓ should generate the ZK IR (Zero-Knowledge Intermediate Representation) for verify_and_claim (1 ms)
    ✓ should successfully prove an accredited user over 18 (240 ms)
    ✓ should reject proof generation for an unaccredited user (15 ms)
    ✓ should reject proof generation for a user under the minimum age limit (12 ms)
    Application Logic Checks
      ✓ should generate deterministic cryptographic nullifiers from secret_identity
      ✓ should ensure the application is pointing to the testnet network (1 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        8.182 s, estimated 11 s
Ran all test suites.
```

## 3. Product-Specific Privacy Summary
The contract successfully utilizes Midnight's **Selective Disclosure**. 
- It proves that `user_credential().age >= 18` and `user_credential().is_accredited == true`.
- The actual values of `age` and `is_accredited` remain entirely within the local user's witness and are never exposed to the public ledger.
- A cryptographic `transientHash` is derived from the user's `secret_id` to prevent double-claiming without revealing the user's identity.
