const CASH_OUT_TIER_1_CAP = 60;
const CASH_OUT_TIER_2_CAP = 120;
const CASH_OUT_TIER_3_CAP = 200;

export function cashOutPayout(points: number): number {
  if (points <= CASH_OUT_TIER_1_CAP) {
    return points;
  }

  if (points <= CASH_OUT_TIER_2_CAP) {
    const extra = points - CASH_OUT_TIER_1_CAP;
    return CASH_OUT_TIER_1_CAP + Math.floor((extra * 85 + 99) / 100);
  }

  if (points <= CASH_OUT_TIER_3_CAP) {
    const extra = points - CASH_OUT_TIER_2_CAP;
    return 111 + Math.floor((extra * 70 + 99) / 100);
  }

  const extra = points - CASH_OUT_TIER_3_CAP;
  return 167 + Math.floor((extra + 1) / 2);
}

// --- Cost tiers & exponential reward curve ---

export const COST_TIERS = [2, 5, 10, 25, 50, 100, 250, 500];
export const BASE_COST = COST_TIERS[0];

const GROWTH_RATE = 1.6;
export const BREAK_EVEN_LEVEL = 14;
export const MAX_LEVEL = 20;

/** Exponential reward at a given game level for a given entry cost. */
export function exponentialReward(level: number, entryCost: number): number {
  const scale = entryCost / GROWTH_RATE ** BREAK_EVEN_LEVEL;
  return scale * GROWTH_RATE ** level;
}

/** Reward multiplier relative to the base $2 tier. */
export function rewardMultiplier(entryCost: number): number {
  return entryCost / BASE_COST;
}

/** Maximum possible reward at MAX_LEVEL. */
export function maxReward(entryCost: number): number {
  return exponentialReward(MAX_LEVEL, entryCost);
}
