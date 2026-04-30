export interface OfflineShopState {
  orbs: number[];
  refreshUsed: boolean;
  burnUsed: boolean;
}

export interface OfflineGame {
  id: number;
  seed: string;
  /** Unix timestamp at which the game ended; 0 = still in progress. */
  over: number;
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
  purchaseCounts: number[];
  moonrocks: number;
  stake: number;
  created_at: number;
}

export interface OfflineOrbPulled {
  game_id: number;
  id: number;
  orb: number;
  potential_moonrocks: number;
}

export interface OfflinePLDataPoint {
  game_id: number;
  id: number;
  potential_moonrocks: number;
  orb: number;
}

export interface OfflineState {
  version: number;
  nextGameId: number;
  activeGameId: number | null;
  games: Record<number, OfflineGame>;
  pulls: OfflineOrbPulled[];
  plDataPoints: OfflinePLDataPoint[];
}
