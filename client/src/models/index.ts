export {
  AchievementAdvancement,
  AchievementAssociation,
  AchievementClaimed,
  AchievementCompleted,
  AchievementCompletion,
  AchievementCreation,
  AchievementDefinition,
  AchievementProgression,
  AchievementTask,
  type RawAchievementAdvancement,
  type RawAchievementAssociation,
  type RawAchievementClaimed,
  type RawAchievementCompleted,
  type RawAchievementCompletion,
  type RawAchievementCreation,
  type RawAchievementDefinition,
  type RawAchievementProgression,
  type RawAchievementTask,
} from "./achievement";
export {
  Bundle,
  BundleGroup,
  BundleIssuance,
  BundleIssued,
  BundleReferral,
  BundleRegistered,
  BundleUpdated,
  BundleVoucher,
  type RawBundle,
  type RawBundleGroup,
  type RawBundleIssuance,
  type RawBundleIssued,
  type RawBundleReferral,
  type RawBundleRegistered,
  type RawBundleUpdated,
  type RawBundleVoucher,
} from "./bundle";
export { Claimed } from "./claimed";
export { Config } from "./config";
export { Game } from "./game";
export { GameOver, GameOverReason, type RawGameOver } from "./game-over";
export { Orb, OrbType } from "./orb";
export { OrbPulled } from "./orb-pulled";
export { PLDataPoint } from "./pl-data-point";
export { Purchased } from "./purchased";
export {
  QuestAdvancement,
  QuestAssociation,
  QuestClaimed,
  QuestCompleted,
  QuestCompletion,
  QuestCondition,
  QuestCreation,
  QuestDefinition,
  QuestMetadata,
  QuestProgression,
  QuestReward,
  QuestTask,
  QuestUnlocked,
  type RawQuestAdvancement,
  type RawQuestAssociation,
  type RawQuestClaimed,
  type RawQuestCompleted,
  type RawQuestCompletion,
  type RawQuestCondition,
  type RawQuestCreation,
  type RawQuestDefinition,
  type RawQuestProgression,
  type RawQuestReward,
  type RawQuestTask,
  type RawQuestUnlocked,
} from "./quest";
export { type RawScore, Score } from "./score";
export { type RawStarted, Started } from "./started";
export { Starterpack } from "./starterpack";
export {
  type RawVaultClaimed,
  type RawVaultInfo,
  type RawVaultPosition,
  VaultClaimed,
  VaultInfo,
  VaultPosition,
} from "./vault";

export interface RawConfig {
  world_resource: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  vrf: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  quote: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  team_address: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  ekubo_router: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  ekubo_positions: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  target_supply: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  burn_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  vault_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  average_weigth: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  average_score: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  last_updated: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  pool_fee: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  pool_tick_spacing: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  pool_extension: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  pool_sqrt: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  base_price: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
}

export interface RawStarterpack {
  id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  reissuable: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  referral_percentage: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  price: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  payment_token: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
}

// Mirrors the on-chain `Game` struct in `contracts/src/models/index.cairo`
// (source of truth). Torii serializes `bool` as JS booleans, every other
// primitive (uXX, felt252) as a hex/decimal string.
export interface RawGame {
  id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  claimed: {
    type: "primitive";
    type_name: "bool";
    value: boolean;
    key: boolean;
  };
  level: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  health: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  immunity: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  curses: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  pull_count: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  points: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  milestone: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  chips: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  moonrocks: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  // Timestamp at which the game ended (0 = still in progress).
  over: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  // Timestamp at which the game expires (created_at + GAME_EXPIRATION_TIME).
  expiration: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  discards: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  shop: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  stake: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  level_counters: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  counters: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  bag: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  supply: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  price: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
}

export interface RawOrbPulled {
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  id: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  orb: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  potential_moonrocks?: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
}

export interface RawClaimed {
  player_id: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  game_id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  reward: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawPurchased {
  player_id: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  starterpack_id: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  quantity: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  multiplier: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  price?: {
    type: "primitive";
    type_name: "u256";
    value: string;
    key: boolean;
  };
  time: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
}

export interface RawPLDataPoint {
  game_id?: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  id?: {
    type: "primitive";
    type_name: "u32";
    value: string;
    key: boolean;
  };
  potential_moonrocks?: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  orb?: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
}
