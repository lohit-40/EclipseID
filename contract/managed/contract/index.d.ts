import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type UserAttributes = { secret_id: bigint;
                               issuer_pk: Uint8Array;
                               is_accredited: boolean;
                               age: bigint
                             };

export type Witnesses<PS> = {
  user_credential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, UserAttributes];
  msgSender(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  add_issuer(context: __compactRuntime.CircuitContext<PS>, issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_claim(context: __compactRuntime.CircuitContext<PS>,
                   issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  add_issuer(context: __compactRuntime.CircuitContext<PS>, issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_claim(context: __compactRuntime.CircuitContext<PS>,
                   issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  add_issuer(context: __compactRuntime.CircuitContext<PS>, issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_and_claim(context: __compactRuntime.CircuitContext<PS>,
                   issuer_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  issuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  used_nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): boolean;
    [Symbol.iterator](): Iterator<[bigint, boolean]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               owner_pk_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
