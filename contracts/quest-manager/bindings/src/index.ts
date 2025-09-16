import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type DistributionType = {tag: "Raffle", values: void} | {tag: "Fcfs", values: void};

export type QuestType = {tag: "TradeVolume", values: readonly [u128]} | {tag: "PoolPosition", values: readonly [u128]} | {tag: "TokenHold", values: readonly [string, u128]};


export interface Quest {
  admin: string;
  description: string;
  distribution: DistributionType;
  end_timestamp: u64;
  id: u64;
  is_active: boolean;
  max_winners: u32;
  quest_type: QuestType;
  reward_per_winner: u128;
  reward_token: string;
  title: string;
  total_reward_pool: u128;
}

export type DataKey = {tag: "Quests", values: readonly [u64]} | {tag: "QuestCounter", values: void} | {tag: "Participants", values: readonly [u64]} | {tag: "Winners", values: readonly [u64]} | {tag: "Registrations", values: readonly [u64, string]} | {tag: "QuestIds", values: void} | {tag: "UserQuests", values: readonly [string]};


export interface QuestCreatedEvent {
  admin: string;
  distribution: DistributionType;
  quest_id: u64;
  reward_token: string;
}


export interface UserRegisteredEvent {
  quest_id: u64;
  user: string;
}


export interface QuestResolvedEvent {
  quest_id: u64;
  winners_count: u32;
}


export interface QuestStats {
  is_resolved: boolean;
  quest_id: u64;
  time_remaining: u64;
  total_eligible: u32;
  total_registered: u32;
  total_winners: u32;
}


export interface TradeVolumeQuest {
  dex_address: string;
  target_volume: u128;
}


export interface PoolPositionQuest {
  min_position: u128;
  pool_address: string;
}


export interface TokenHoldQuest {
  hold_duration: u64;
  min_amount: u128;
  token: string;
}


export interface QuestConfig {
  allow_multiple_entries: boolean;
  geographic_restrictions: string;
  min_account_age: u64;
  require_kyc: boolean;
}


export interface QuestMetadata {
  category: string;
  difficulty: u32;
  estimated_completion_time: u64;
  external_url: string;
  image_url: string;
}


export interface UserStats {
  total_participated: u32;
  total_rewards: u128;
  total_won: u32;
  win_rate: u128;
}

export const Errors = {
  1: {message:"QuestNotFound"},
  2: {message:"QuestNotActive"},
  3: {message:"QuestExpired"},
  4: {message:"QuestNotFinished"},
  5: {message:"QuestAlreadyResolved"},
  6: {message:"QuestNotResolved"},
  7: {message:"AlreadyRegistered"},
  8: {message:"UserNotRegistered"},
  9: {message:"InvalidMaxWinners"},
  10: {message:"InvalidRewardAmount"},
  11: {message:"InsufficientRewardPool"},
  12: {message:"InvalidDuration"},
  13: {message:"NoWinners"},
  14: {message:"Unauthorized"},
  15: {message:"InsufficientBalance"}
}

export interface Client {
  /**
   * Construct and simulate a create_quest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cria uma nova quest/campanha
   * Apenas o admin pode criar quests
   */
  create_quest: ({admin, reward_token, reward_per_winner, max_winners, distribution, quest_type, duration_seconds, reward_pool_amount, title, description}: {admin: string, reward_token: string, reward_per_winner: u128, max_winners: u32, distribution: DistributionType, quest_type: QuestType, duration_seconds: u64, reward_pool_amount: u128, title: string, description: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a register transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permite que um usuário se registre para participar de uma quest
   */
  register: ({quest_id, user}: {quest_id: u64, user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a mark_user_eligible transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Marca um usuário como elegível (chamado pelo backend quando o usuário completa a tarefa)
   */
  mark_user_eligible: ({quest_id, user}: {quest_id: u64, user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a resolve_quest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Resolve uma quest (faz o sorteio se necessário)
   */
  resolve_quest: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a distribute_rewards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Distribui as recompensas para os ganhadores
   */
  distribute_rewards: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_quest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém informações de uma quest específica
   */
  get_quest: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Quest>>

  /**
   * Construct and simulate a get_active_quests transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém todas as quests ativas
   */
  get_active_quests: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Quest>>>

  /**
   * Construct and simulate a get_participants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém os participantes de uma quest
   */
  get_participants: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a get_winners transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém os ganhadores de uma quest
   */
  get_winners: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a is_user_registered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verifica se um usuário está registrado em uma quest
   */
  is_user_registered: ({quest_id, user}: {quest_id: u64, user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_user_quests transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém as quests em que um usuário está participando
   */
  get_user_quests: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u64>>>

  /**
   * Construct and simulate a get_quest_counter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém o contador atual de quests
   */
  get_quest_counter: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_quest_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém estatísticas de uma quest
   */
  get_quest_stats: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<QuestStats>>

  /**
   * Construct and simulate a get_user_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Obtém estatísticas de participação de um usuário
   */
  get_user_stats: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<UserStats>>

  /**
   * Construct and simulate a cancel_quest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Função administrativa para cancelar uma quest
   */
  cancel_quest: ({quest_id}: {quest_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAEERpc3RyaWJ1dGlvblR5cGUAAAACAAAAAAAAAAAAAAAGUmFmZmxlAAAAAAAAAAAAAAAAAARGY2Zz",
        "AAAAAgAAAAAAAAAAAAAACVF1ZXN0VHlwZQAAAAAAAAMAAAABAAAAAAAAAAtUcmFkZVZvbHVtZQAAAAABAAAACgAAAAEAAAAAAAAADFBvb2xQb3NpdGlvbgAAAAEAAAAKAAAAAQAAAAAAAAAJVG9rZW5Ib2xkAAAAAAAAAgAAABMAAAAK",
        "AAAAAQAAAAAAAAAAAAAABVF1ZXN0AAAAAAAADAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAxkaXN0cmlidXRpb24AAAfQAAAAEERpc3RyaWJ1dGlvblR5cGUAAAAAAAAADWVuZF90aW1lc3RhbXAAAAAAAAAGAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAALbWF4X3dpbm5lcnMAAAAABAAAAAAAAAAKcXVlc3RfdHlwZQAAAAAH0AAAAAlRdWVzdFR5cGUAAAAAAAAAAAAAEXJld2FyZF9wZXJfd2lubmVyAAAAAAAACgAAAAAAAAAMcmV3YXJkX3Rva2VuAAAAEwAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAABF0b3RhbF9yZXdhcmRfcG9vbAAAAAAAAAo=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAEAAAAAAAAABlF1ZXN0cwAAAAAAAQAAAAYAAAAAAAAAAAAAAAxRdWVzdENvdW50ZXIAAAABAAAAAAAAAAxQYXJ0aWNpcGFudHMAAAABAAAABgAAAAEAAAAAAAAAB1dpbm5lcnMAAAAAAQAAAAYAAAABAAAAAAAAAA1SZWdpc3RyYXRpb25zAAAAAAAAAgAAAAYAAAATAAAAAAAAAAAAAAAIUXVlc3RJZHMAAAABAAAAAAAAAApVc2VyUXVlc3RzAAAAAAABAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAEVF1ZXN0Q3JlYXRlZEV2ZW50AAAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAxkaXN0cmlidXRpb24AAAfQAAAAEERpc3RyaWJ1dGlvblR5cGUAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAAAAAAMcmV3YXJkX3Rva2VuAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1VzZXJSZWdpc3RlcmVkRXZlbnQAAAAAAgAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAAAAAAR1c2VyAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAElF1ZXN0UmVzb2x2ZWRFdmVudAAAAAAAAgAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAAAAAA13aW5uZXJzX2NvdW50AAAAAAAABA==",
        "AAAAAAAAAD1DcmlhIHVtYSBub3ZhIHF1ZXN0L2NhbXBhbmhhCkFwZW5hcyBvIGFkbWluIHBvZGUgY3JpYXIgcXVlc3RzAAAAAAAADGNyZWF0ZV9xdWVzdAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAMcmV3YXJkX3Rva2VuAAAAEwAAAAAAAAARcmV3YXJkX3Blcl93aW5uZXIAAAAAAAAKAAAAAAAAAAttYXhfd2lubmVycwAAAAAEAAAAAAAAAAxkaXN0cmlidXRpb24AAAfQAAAAEERpc3RyaWJ1dGlvblR5cGUAAAAAAAAACnF1ZXN0X3R5cGUAAAAAB9AAAAAJUXVlc3RUeXBlAAAAAAAAAAAAABBkdXJhdGlvbl9zZWNvbmRzAAAABgAAAAAAAAAScmV3YXJkX3Bvb2xfYW1vdW50AAAAAAAKAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAABAAAABg==",
        "AAAAAAAAAEBQZXJtaXRlIHF1ZSB1bSB1c3XDoXJpbyBzZSByZWdpc3RyZSBwYXJhIHBhcnRpY2lwYXIgZGUgdW1hIHF1ZXN0AAAACHJlZ2lzdGVyAAAAAgAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAAAAAAR1c2VyAAAAEwAAAAA=",
        "AAAAAAAAAFtNYXJjYSB1bSB1c3XDoXJpbyBjb21vIGVsZWfDrXZlbCAoY2hhbWFkbyBwZWxvIGJhY2tlbmQgcXVhbmRvIG8gdXN1w6FyaW8gY29tcGxldGEgYSB0YXJlZmEpAAAAABJtYXJrX3VzZXJfZWxpZ2libGUAAAAAAAIAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAAAAAAEdXNlcgAAABMAAAAA",
        "AAAAAAAAADBSZXNvbHZlIHVtYSBxdWVzdCAoZmF6IG8gc29ydGVpbyBzZSBuZWNlc3PDoXJpbykAAAANcmVzb2x2ZV9xdWVzdAAAAAAAAAEAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAA=",
        "AAAAAAAAACtEaXN0cmlidWkgYXMgcmVjb21wZW5zYXMgcGFyYSBvcyBnYW5oYWRvcmVzAAAAABJkaXN0cmlidXRlX3Jld2FyZHMAAAAAAAEAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAA=",
        "AAAAAAAAAC1PYnTDqW0gaW5mb3JtYcOnw7VlcyBkZSB1bWEgcXVlc3QgZXNwZWPDrWZpY2EAAAAAAAAJZ2V0X3F1ZXN0AAAAAAAAAQAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAQAAB9AAAAAFUXVlc3QAAAA=",
        "AAAAAAAAAB1PYnTDqW0gdG9kYXMgYXMgcXVlc3RzIGF0aXZhcwAAAAAAABFnZXRfYWN0aXZlX3F1ZXN0cwAAAAAAAAAAAAABAAAD6gAAB9AAAAAFUXVlc3QAAAA=",
        "AAAAAAAAACRPYnTDqW0gb3MgcGFydGljaXBhbnRlcyBkZSB1bWEgcXVlc3QAAAAQZ2V0X3BhcnRpY2lwYW50cwAAAAEAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAEAAAPqAAAAEw==",
        "AAAAAAAAACFPYnTDqW0gb3MgZ2FuaGFkb3JlcyBkZSB1bWEgcXVlc3QAAAAAAAALZ2V0X3dpbm5lcnMAAAAAAQAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAQAAA+oAAAAT",
        "AAAAAAAAADVWZXJpZmljYSBzZSB1bSB1c3XDoXJpbyBlc3TDoSByZWdpc3RyYWRvIGVtIHVtYSBxdWVzdAAAAAAAABJpc191c2VyX3JlZ2lzdGVyZWQAAAAAAAIAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAAAAAAEdXNlcgAAABMAAAABAAAAAQ==",
        "AAAAAAAAADZPYnTDqW0gYXMgcXVlc3RzIGVtIHF1ZSB1bSB1c3XDoXJpbyBlc3TDoSBwYXJ0aWNpcGFuZG8AAAAAAA9nZXRfdXNlcl9xdWVzdHMAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6gAAAAY=",
        "AAAAAAAAACFPYnTDqW0gbyBjb250YWRvciBhdHVhbCBkZSBxdWVzdHMAAAAAAAARZ2V0X3F1ZXN0X2NvdW50ZXIAAAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAACFPYnTDqW0gZXN0YXTDrXN0aWNhcyBkZSB1bWEgcXVlc3QAAAAAAAAPZ2V0X3F1ZXN0X3N0YXRzAAAAAAEAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAEAAAfQAAAAClF1ZXN0U3RhdHMAAA==",
        "AAAAAAAAADVPYnTDqW0gZXN0YXTDrXN0aWNhcyBkZSBwYXJ0aWNpcGHDp8OjbyBkZSB1bSB1c3XDoXJpbwAAAAAAAA5nZXRfdXNlcl9zdGF0cwAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAH0AAAAAlVc2VyU3RhdHMAAAA=",
        "AAAAAAAAAC9GdW7Dp8OjbyBhZG1pbmlzdHJhdGl2YSBwYXJhIGNhbmNlbGFyIHVtYSBxdWVzdAAAAAAMY2FuY2VsX3F1ZXN0AAAAAQAAAAAAAAAIcXVlc3RfaWQAAAAGAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAAClF1ZXN0U3RhdHMAAAAAAAYAAAAAAAAAC2lzX3Jlc29sdmVkAAAAAAEAAAAAAAAACHF1ZXN0X2lkAAAABgAAAAAAAAAOdGltZV9yZW1haW5pbmcAAAAAAAYAAAAAAAAADnRvdGFsX2VsaWdpYmxlAAAAAAAEAAAAAAAAABB0b3RhbF9yZWdpc3RlcmVkAAAABAAAAAAAAAANdG90YWxfd2lubmVycwAAAAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAAEFRyYWRlVm9sdW1lUXVlc3QAAAACAAAAAAAAAAtkZXhfYWRkcmVzcwAAAAATAAAAAAAAAA10YXJnZXRfdm9sdW1lAAAAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAEVBvb2xQb3NpdGlvblF1ZXN0AAAAAAAAAgAAAAAAAAAMbWluX3Bvc2l0aW9uAAAACgAAAAAAAAAMcG9vbF9hZGRyZXNzAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAADlRva2VuSG9sZFF1ZXN0AAAAAAADAAAAAAAAAA1ob2xkX2R1cmF0aW9uAAAAAAAABgAAAAAAAAAKbWluX2Ftb3VudAAAAAAACgAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAAC1F1ZXN0Q29uZmlnAAAAAAQAAAAAAAAAFmFsbG93X211bHRpcGxlX2VudHJpZXMAAAAAAAEAAAAAAAAAF2dlb2dyYXBoaWNfcmVzdHJpY3Rpb25zAAAAABAAAAAAAAAAD21pbl9hY2NvdW50X2FnZQAAAAAGAAAAAAAAAAtyZXF1aXJlX2t5YwAAAAAB",
        "AAAAAQAAAAAAAAAAAAAADVF1ZXN0TWV0YWRhdGEAAAAAAAAFAAAAAAAAAAhjYXRlZ29yeQAAABAAAAAAAAAACmRpZmZpY3VsdHkAAAAAAAQAAAAAAAAAGWVzdGltYXRlZF9jb21wbGV0aW9uX3RpbWUAAAAAAAAGAAAAAAAAAAxleHRlcm5hbF91cmwAAAAQAAAAAAAAAAlpbWFnZV91cmwAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAACVVzZXJTdGF0cwAAAAAAAAQAAAAAAAAAEnRvdGFsX3BhcnRpY2lwYXRlZAAAAAAABAAAAAAAAAANdG90YWxfcmV3YXJkcwAAAAAAAAoAAAAAAAAACXRvdGFsX3dvbgAAAAAAAAQAAAAAAAAACHdpbl9yYXRlAAAACg==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADwAAAAAAAAANUXVlc3ROb3RGb3VuZAAAAAAAAAEAAAAAAAAADlF1ZXN0Tm90QWN0aXZlAAAAAAACAAAAAAAAAAxRdWVzdEV4cGlyZWQAAAADAAAAAAAAABBRdWVzdE5vdEZpbmlzaGVkAAAABAAAAAAAAAAUUXVlc3RBbHJlYWR5UmVzb2x2ZWQAAAAFAAAAAAAAABBRdWVzdE5vdFJlc29sdmVkAAAABgAAAAAAAAARQWxyZWFkeVJlZ2lzdGVyZWQAAAAAAAAHAAAAAAAAABFVc2VyTm90UmVnaXN0ZXJlZAAAAAAAAAgAAAAAAAAAEUludmFsaWRNYXhXaW5uZXJzAAAAAAAACQAAAAAAAAATSW52YWxpZFJld2FyZEFtb3VudAAAAAAKAAAAAAAAABZJbnN1ZmZpY2llbnRSZXdhcmRQb29sAAAAAAALAAAAAAAAAA9JbnZhbGlkRHVyYXRpb24AAAAADAAAAAAAAAAJTm9XaW5uZXJzAAAAAAAADQAAAAAAAAAMVW5hdXRob3JpemVkAAAADgAAAAAAAAATSW5zdWZmaWNpZW50QmFsYW5jZQAAAAAP" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_quest: this.txFromJSON<u64>,
        register: this.txFromJSON<null>,
        mark_user_eligible: this.txFromJSON<null>,
        resolve_quest: this.txFromJSON<null>,
        distribute_rewards: this.txFromJSON<null>,
        get_quest: this.txFromJSON<Quest>,
        get_active_quests: this.txFromJSON<Array<Quest>>,
        get_participants: this.txFromJSON<Array<string>>,
        get_winners: this.txFromJSON<Array<string>>,
        is_user_registered: this.txFromJSON<boolean>,
        get_user_quests: this.txFromJSON<Array<u64>>,
        get_quest_counter: this.txFromJSON<u64>,
        get_quest_stats: this.txFromJSON<QuestStats>,
        get_user_stats: this.txFromJSON<UserStats>,
        cancel_quest: this.txFromJSON<null>
  }
}