/**
 * On-chain constants from contracts/src/constants.cairo
 */
export const MAX_SCORE = 524;
export const STARTERPACK_COUNT = 10;
export const PRICE_MULTIPLIER = 100_000n;
export const DEFAULT_ENTRY_PRICE = 2_000_000n;
export const TOKEN_DECIMALS = 6;
/** Scale table values (*100) to raw 6-decimal token units: 10^6 / 100 = 10_000 */
const REWARD_SCALE = 10_000n;

/**
 * Stepped base reward lookup table.
 * Mirrors on-chain RewarderImpl::base_reward — score thresholds map to base reward values.
 */
const REWARD_TIERS: [number, number][] = [
  [524, 1000],
  [428, 720],
  [356, 530],
  [300, 395],
  [256, 300],
  [222, 230],
  [196, 182],
  [176, 147],
  [160, 121],
  [148, 100],
  [138, 88],
  [130, 77],
  [124, 69],
  [118, 61],
  [112, 54],
  [106, 46],
  [100, 40],
  [94, 34],
  [88, 25],
  [78, 13],
  [65, 1],
];

/**
 * Stepped base reward matching on-chain RewarderImpl::base_reward.
 */
function baseReward(score: number): number {
  for (const [threshold, reward] of REWARD_TIERS) {
    if (score >= threshold) return reward;
  }
  return 0;
}

/**
 * Compute reward for a given score with supply adjustment.
 * Mirrors on-chain RewarderImpl::amount.
 *
 * Supply adjustment yields 2x at zero supply, 1x at target, 0x at 2x target.
 */
export function rewardAmount(
  score: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  if (score <= 0) return 0;

  if (target > 0n && supply >= target * 2n) return 0;

  const base = baseReward(score);
  if (base === 0) return 0;

  const scaled = BigInt(base) * REWARD_SCALE;

  if (target === 0n) return Number(scaled);

  // Supply adjustment: scaled * (2 * target - supply) / target
  const result = (scaled * (2n * target - supply)) / target;
  return Number(result);
}

/**
 * Token payout (raw units) for a given score and stake multiplier.
 * Mirrors on-chain: amount(score, supply, target) * stake
 */
export function tokenPayout(
  score: number,
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  return rewardAmount(score, supply, target) * stake;
}

/**
 * Convert raw token units to human-readable decimal value.
 */
export function toTokens(rawAmount: bigint | number): number {
  return Number(rawAmount) / 10 ** TOKEN_DECIMALS;
}

/**
 * Compute tier price in raw token units.
 * Mirrors on-chain starterpack initialization:
 *   price = stake * base_price * (PM - stake * PM / 100) / PM
 */
export function tierPrice(stake: number): bigint {
  const s = BigInt(stake);
  return (
    (s *
      DEFAULT_ENTRY_PRICE *
      (PRICE_MULTIPLIER - (s * PRICE_MULTIPLIER) / 100n)) /
    PRICE_MULTIPLIER
  );
}

/** Full price without the multiplier discount (stake x base_price). */
export function tierFullPrice(stake: number): bigint {
  return BigInt(stake) * DEFAULT_ENTRY_PRICE;
}

/** All tier prices in raw token units (stake 1 through STARTERPACK_COUNT). */
export const TIER_PRICES: bigint[] = Array.from(
  { length: STARTERPACK_COUNT },
  (_, i) => tierPrice(i + 1),
);

/**
 * Reward at each score from 1 through MAX_SCORE.
 * Returns an array of length MAX_SCORE where index i = reward (raw units) at score (i+1).
 * Used by the payout chart for plotting the stepped reward curve.
 */
export function scoreRewards(
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number[] {
  const result: number[] = [];
  for (let s = 1; s <= MAX_SCORE; s++) {
    result.push(tokenPayout(s, stake, supply, target));
  }
  return result;
}

/** Maximum token payout (raw units) at max score for a given stake. */
export function maxPayout(
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  return tokenPayout(MAX_SCORE, stake, supply, target);
}

/**
 * Break-even moonrocks score.
 * First score at which the GLITCH token reward (in USD)
 * covers the game's purchase cost (in USDC), given the live token price.
 * Returns MAX_SCORE when price is unavailable (hides crosshairs).
 */
export function breakEvenScore(
  stake?: number,
  tokenPrice?: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  if (!stake || !tokenPrice || tokenPrice <= 0) return MAX_SCORE;

  const cost = toTokens(tierPrice(stake));
  for (let s = 1; s <= MAX_SCORE; s++) {
    if (toTokens(tokenPayout(s, stake, supply, target)) * tokenPrice >= cost) {
      return s;
    }
  }
  return MAX_SCORE;
}
