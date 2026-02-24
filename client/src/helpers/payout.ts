/**
 * On-chain constants from contracts/src/constants.cairo
 */
export const MAX_SCORE = 500;
export const REWARD_NUMERATOR = 359_105_052_483_616_060n;
export const REWARD_OFFSET = 10;
export const STARTERPACK_COUNT = 10;
export const PRICE_MULTIPLIER = 100_000n;
export const DEFAULT_ENTRY_PRICE = 2_000_000n;
export const TOKEN_DECIMALS = 6;

/**
 * Compute base reward for a given score using the progressive x^5 curve.
 * Mirrors on-chain RewarderImpl::amount at target supply.
 *
 * reward = NUM / (DEN - score^5) - NUM / DEN
 * where DEN = (MAX_SCORE + REWARD_OFFSET)^5 = 510^5
 */
export function baseReward(score: number): number {
  if (score <= 0) return 0;
  if (score > MAX_SCORE) score = MAX_SCORE;

  const num = REWARD_NUMERATOR;
  const base = BigInt(MAX_SCORE + REWARD_OFFSET); // 510
  const den = base ** 5n;
  const s5 = BigInt(score) ** 5n;

  if (s5 >= den) return Number(num);

  const reward = num / (den - s5) - num / den;
  return Number(reward);
}

/**
 * Token payout (raw units) for a given score and stake multiplier.
 * Mirrors on-chain: reward * stake
 */
export function tokenPayout(score: number, stake: number): number {
  return baseReward(score) * stake;
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

/** All tier prices in raw token units (stake 1 through STARTERPACK_COUNT). */
export const TIER_PRICES: bigint[] = Array.from(
  { length: STARTERPACK_COUNT },
  (_, i) => tierPrice(i + 1),
);

/** Maximum token payout (raw units) at max score for a given stake. */
export function maxPayout(stake: number): number {
  return tokenPayout(MAX_SCORE, stake);
}

/**
 * Find the score where token payout reaches break-even.
 * When tokenPrice (USD per token) is provided, break-even = first score
 * where tokenPayout * tokenPrice >= tier cost in USD.
 * Without tokenPrice, compares raw token units directly.
 */
export function breakEvenScore(stake: number, tokenPrice?: number): number {
  const cost = toTokens(tierPrice(stake));
  for (let s = 1; s <= MAX_SCORE; s++) {
    const tokens = toTokens(tokenPayout(s, stake));
    const value = tokenPrice != null ? tokens * tokenPrice : tokens;
    if (value >= cost) return s;
  }
  return MAX_SCORE;
}
