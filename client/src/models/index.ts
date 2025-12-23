export { Config } from "./config";
export { Game } from "./game";
export { Orb } from "./orb";
export { Pack } from "./pack";
export { Starterpack } from "./starterpack";
export const CONFIG = "Config";
export const GAME = "Game";
export const PACK = "Pack";
export const STARTERPACK = "Starterpack";

export interface RawConfig {
  id: {
    type: "primitive";
    type_name: "felt252";
    value: string;
    key: boolean;
  };
  vrf: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  token: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  registry: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  owner: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  fee_receiver: {
    type: "primitive";
    type_name: "contract_address";
    value: string;
    key: boolean;
  };
  entry_price: {
    type: "primitive";
    type_name: "felt252";
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

export interface RawPack {
  id: {
    type: "primitive";
    type_name: "u64";
    value: string;
    key: boolean;
  };
  game_count: {
    type: "primitive";
    type_name: "u8";
    value: string;
    key: boolean;
  };
  moonrocks: {
    type: "primitive";
    type_name: "u16";
    value: string;
    key: boolean;
  };
}

export interface RawGame {
  pack_id: {
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
}
