export interface OfflinePack {
  id: number;
  game_count: number;
  moonrocks: number;
  entry_cost?: number;
}

export interface OfflineShopState {
  orbs: number[];
  refreshUsed: boolean;
  burnUsed: boolean;
  purchaseCounts: number[];
}

export interface OfflineGame {
  pack_id: number;
  id: number;
  seed: string;
  over: boolean;
  level: number;
  health: number;
  immunity: number;
  curses: number;
  pull_count: number;
  points: number;
  milestone: number;
  multiplier: number;
  chips: number;
  discards: boolean[];
  bag: number[];
  shop: OfflineShopState | null;
}

export interface OfflineOrbPulled {
  pack_id: number;
  game_id: number;
  id: number;
  orb: number;
  potential_moonrocks: number;
}

export interface OfflinePLDataPoint {
  pack_id: number;
  game_id: number;
  id: number;
  potential_moonrocks: number;
  orb: number;
}

export interface OfflineState {
  version: number;
  nextPackId: number;
  packs: Record<number, OfflinePack>;
  games: Record<string, OfflineGame>;
  pulls: OfflineOrbPulled[];
  plDataPoints: OfflinePLDataPoint[];
}
