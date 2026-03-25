/**
 * On-chain constants from contracts/src/constants.cairo
 */
export const MAX_SCORE = 500;
export const REWARD_NUMERATOR = 35_910_505_248_361_606_000_000n;
export const REWARD_OFFSET = 10;
export const STARTERPACK_COUNT = 10;
export const PRICE_MULTIPLIER = 100_000n;
export const DEFAULT_ENTRY_PRICE = 2_000_000n;
export const TOKEN_DECIMALS = 6;

/**
 * Compute base reward for a given score using the progressive x^5 curve.
 * Mirrors on-chain RewarderImpl::amount with supply adjustment.
 *
 * reward = num / (DEN - score^5) - num / DEN
 * where DEN = (MAX_SCORE + REWARD_OFFSET)^5 = 510^5
 * and num is adjusted based on supply vs target.
 */
export function baseReward(
  score: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  if (score <= 0) return 0;
  if (score > MAX_SCORE) score = MAX_SCORE;

  // No reward if supply meets or exceeds 2x target
  if (target > 0n && supply >= target * 2n) return 0;

  const numerator = REWARD_NUMERATOR;
  const base = BigInt(MAX_SCORE + REWARD_OFFSET); // 510
  const den = base ** 5n;
  const s5 = BigInt(score) ** 5n;

  if (s5 >= den) return Number(numerator);

  // Supply adjustment (mirrors on-chain RewarderImpl)
  let num: bigint;
  if (target === 0n) {
    // No target configured — use raw numerator (equivalent to supply == target)
    num = numerator;
  } else if (supply <= target) {
    num = numerator + (numerator * (target - supply)) / target;
  } else {
    num = numerator - (numerator * (supply - target)) / target;
  }

  const reward = num / (den - s5) - num / den;
  return Number(reward);
}

/**
 * Token payout (raw units) for a given score and stake multiplier.
 * Mirrors on-chain: reward * stake
 */
export function tokenPayout(
  score: number,
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  return baseReward(score, supply, target) * stake;
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

/** Full price without the multiplier discount (stake × base_price). */
export function tierFullPrice(stake: number): bigint {
  return BigInt(stake) * DEFAULT_ENTRY_PRICE;
}

/** All tier prices in raw token units (stake 1 through STARTERPACK_COUNT). */
export const TIER_PRICES: bigint[] = Array.from(
  { length: STARTERPACK_COUNT },
  (_, i) => tierPrice(i + 1),
);

/**
 * Cumulative token rewards (raw units) from score 1 through each score.
 * Returns an array of length MAX_SCORE where index i = cumulative reward at score (i+1).
 * Mirrors Nums ChartHelper.calculate() pattern.
 */
export function cumulativeRewards(
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number[] {
  const result: number[] = [];
  let cumulative = 0;
  for (let s = 1; s <= MAX_SCORE; s++) {
    cumulative += tokenPayout(s, stake, supply, target);
    result.push(cumulative);
  }
  return result;
}

/** Maximum token payout (raw units) — cumulative reward at max score for a given stake. */
export function maxPayout(
  stake: number,
  supply: bigint = 0n,
  target: bigint = 0n,
): number {
  const rewards = cumulativeRewards(stake, supply, target);
  return rewards[rewards.length - 1];
}

/**
 * Break-even moonrocks score.
 * First score at which the cumulative GLITCH token reward (in USD)
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
  const rewards = cumulativeRewards(stake, supply, target);
  for (let i = 0; i < rewards.length; i++) {
    if (toTokens(rewards[i]) * tokenPrice >= cost) {
      return i + 1;
    }
  }
  return MAX_SCORE;
}
