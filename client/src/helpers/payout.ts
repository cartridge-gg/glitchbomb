/** Step thresholds: moonrocks → glitch tokens. Mirrors on-chain cash_out_payout. */
export const PAYOUT_STEPS: [number, number][] = [
  [300, 10],
  [250, 8],
  [200, 6],
  [150, 4],
  [120, 3],
  [100, 2],
  [60, 1],
];

export function cashOutPayout(points: number): number {
  for (const [threshold, payout] of PAYOUT_STEPS) {
    if (points >= threshold) return payout;
  }
  return 0;
}

// --- Cost tiers & payout helpers ---

export const COST_TIERS = [2, 5, 10, 25, 50, 100, 250, 500];
export const BASE_COST = COST_TIERS[0];

/** Max points shown on the payout chart. */
export const MAX_CHART_POINTS = 300;

/** Reward multiplier relative to the base $2 tier. */
export function rewardMultiplier(entryCost: number): number {
  return entryCost / BASE_COST;
}

/** Token payout for a given number of points at a given entry cost. */
export function tokenPayout(points: number, entryCost: number): number {
  return (cashOutPayout(points) * entryCost) / BASE_COST;
}

/**
 * Find the points threshold where USD value of token payout >= entry cost (break-even).
 * When tokenPrice is provided, break-even = first point where tokenPayout * tokenPrice >= entryCost.
 * Without tokenPrice, falls back to tokenPayout >= entryCost (assumes $1/token).
 */
export function breakEvenPoints(
  entryCost: number,
  tokenPrice?: number,
): number {
  for (let p = 1; p <= MAX_CHART_POINTS; p++) {
    const tokens = tokenPayout(p, entryCost);
    const usdValue = tokenPrice != null ? tokens * tokenPrice : tokens;
    if (usdValue >= entryCost) return p;
  }
  return MAX_CHART_POINTS;
}

/** Maximum token payout at MAX_CHART_POINTS. */
export function maxPayout(entryCost: number): number {
  return tokenPayout(MAX_CHART_POINTS, entryCost);
}
