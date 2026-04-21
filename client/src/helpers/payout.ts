export const TOKEN_DECIMALS = 18;
export const QUOTE_DECIMALS = 6;
export const TEN_POW_18 = 10n ** 18n;
export const MULTIPLIER_PRECISION = 1_000_000n;
const BASE_MULTIPLIER = 100n;

export const MAX_SCORE = 524;
export const STARTERPACK_COUNT = 10;
export const PRICE_MULTIPLIER = 100_000n;
export const DEFAULT_ENTRY_PRICE = 2_000_000n;

const REWARD_TIERS: [number, bigint][] = [
  [524, 1000n],
  [428, 720n],
  [356, 530n],
  [300, 395n],
  [256, 300n],
  [222, 230n],
  [196, 182n],
  [176, 147n],
  [160, 121n],
  [148, 100n],
  [138, 88n],
  [130, 77n],
  [124, 69n],
  [118, 61n],
  [112, 54n],
  [106, 46n],
  [100, 40n],
  [94, 34n],
  [88, 25n],
  [78, 13n],
  [65, 1n],
];

/** Mirrors on-chain Rewarder::base. Returns TEN_POW_18-scaled value. */
export function base(score: number): bigint {
  for (const [threshold, reward] of REWARD_TIERS) {
    if (score >= threshold) return (reward * TEN_POW_18) / BASE_MULTIPLIER;
  }
  return 0n;
}

/** Mirrors on-chain Rewarder::supply_multiplier. Returns MULTIPLIER_PRECISION-based value. */
export function supplyMultiplier(supply: bigint, target: bigint): bigint {
  if (supply > target * 2n || target === 0n) return 0n;
  return ((2n * target - supply) * MULTIPLIER_PRECISION) / target;
}

/** Mirrors on-chain Rewarder::burn_multiplier. Returns MULTIPLIER_PRECISION-based value. */
export function burnMultiplier(burn: bigint, score: number): bigint {
  const mint = base(score);
  if (mint === 0n) return 0n;
  return (burn * MULTIPLIER_PRECISION) / mint;
}

/** Mirrors on-chain Rewarder::multiplier. Returns MULTIPLIER_PRECISION-based value. */
export function computeMultiplier(
  supply: bigint,
  target: bigint,
  burn: bigint,
  score: number,
): bigint {
  const sm = supplyMultiplier(supply, target);
  const bm = burnMultiplier(burn, score);
  return (sm * bm) / MULTIPLIER_PRECISION;
}

/** Mirrors on-chain Rewarder::amount. Multiplier is game.stake. Returns TEN_POW_18-scaled value. */
export function amount(score: number, multiplier: bigint): bigint {
  const b = base(score);
  return (b * multiplier) / MULTIPLIER_PRECISION;
}

export function tokenPayout(score: number, multiplier: bigint): bigint {
  return amount(score, multiplier);
}

export function toTokens(rawAmount: bigint | number): number {
  return Number(rawAmount) / 10 ** TOKEN_DECIMALS;
}

/** Tier price in USDC raw units: stake * base_price * (PM - stake * PM / 100) / PM */
export function tierPrice(stake: number): bigint {
  const s = BigInt(stake);
  return (
    (s *
      DEFAULT_ENTRY_PRICE *
      (PRICE_MULTIPLIER - (s * PRICE_MULTIPLIER) / 100n)) /
    PRICE_MULTIPLIER
  );
}

export function tierFullPrice(stake: number): bigint {
  return BigInt(stake) * DEFAULT_ENTRY_PRICE;
}

export const TIER_PRICES: bigint[] = Array.from(
  { length: STARTERPACK_COUNT },
  (_, i) => tierPrice(i + 1),
);

/** Reward at each score from 1 through MAX_SCORE (human-readable). */
export function scoreRewards(multiplier: bigint): number[] {
  const result: number[] = [];
  for (let s = 1; s <= MAX_SCORE; s++) {
    result.push(toTokens(amount(s, multiplier)));
  }
  return result;
}

export function maxPayout(multiplier: bigint): number {
  return toTokens(amount(MAX_SCORE, multiplier));
}

/** First score where token reward (USD) covers USDC cost. MAX_SCORE if unavailable. */
export function breakEvenScore(
  multiplier: bigint,
  tokenPrice?: number,
  stake?: number,
): number {
  if (!stake || !tokenPrice || tokenPrice <= 0) return MAX_SCORE;

  const cost = Number(tierPrice(stake)) / 10 ** QUOTE_DECIMALS;
  for (let s = 1; s <= MAX_SCORE; s++) {
    if (toTokens(amount(s, multiplier)) * tokenPrice >= cost) {
      return s;
    }
  }
  return MAX_SCORE;
}
