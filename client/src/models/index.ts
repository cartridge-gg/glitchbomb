export {
  ACHIEVEMENT_ADVANCEMENT,
  ACHIEVEMENT_ASSOCIATION,
  ACHIEVEMENT_CLAIMED,
  ACHIEVEMENT_COMPLETED,
  ACHIEVEMENT_COMPLETION,
  ACHIEVEMENT_CREATION,
  ACHIEVEMENT_DEFINITION,
  ACHIEVEMENT_PROGRESSION,
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
export { CLAIMED, Claimed, type RawClaimed } from "./claimed";
export { CONFIG, Config } from "./config";
export { GAME, Game } from "./game";
export {
  GAME_OVER,
  GameOver,
  GameOverReason,
  type RawGameOver,
} from "./game-over";
export { Orb, OrbType } from "./orb";
export { ORB_PULLED, OrbPulled } from "./orb-pulled";
export { PL_DATA_POINT, PLDataPoint } from "./pl-data-point";
export { PURCHASED, Purchased, type RawPurchased } from "./purchased";
export {
  QUEST_ADVANCEMENT,
  QUEST_ASSOCIATION,
  QUEST_CLAIMED,
  QUEST_COMPLETED,
  QUEST_COMPLETION,
  QUEST_CONDITION,
  QUEST_CREATION,
  QUEST_DEFINITION,
  QUEST_PROGRESSION,
  QUEST_UNLOCKED,
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
export { type RawStarted, STARTED, Started } from "./started";
export { STARTERPACK, Starterpack } from "./starterpack";
export {
  type RawVaultClaimed,
  VAULT_CLAIMED,
  VaultClaimed,
} from "./vault-claimed";
export { type RawVaultPaid, VAULT_PAID, VaultPaid } from "./vault-paid";

export interface RawConfig {
  id: {
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
  token: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  registry: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  owner: {
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
  ekubo: {
    type: "primitive";
    type_name: "ContractAddress";
    value: string;
    key: boolean;
  };
  entry_price: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  target_supply: {
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

export interface RawGame {
  id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  over: {
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
  discards: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  bag: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  shop: {
    type: "primitive";
    type_name: "u128";
    value: string;
    key: boolean;
  };
  moonrocks: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
  stake: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  created_at: {
    type: "primitive";
    type_name: "u64";
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
