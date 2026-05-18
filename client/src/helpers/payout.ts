export const TOKEN_DECIMALS = 18;
export const QUOTE_DECIMALS = 6;
export const TEN_POW_18 = 10n ** 18n;
export const MULTIPLIER_PRECISION = 1_000_000n;
const BASE_MULTIPLIER = 1n;

export const MAX_SCORE = 524;
export const STARTERPACK_COUNT = 10;
export const DEFAULT_ENTRY_PRICE = 2_000_000n;
/**
 * Fixed-point scale used to convert a fractional reward multiplier
 * (e.g. boosted `stake * (1 + stake / 100)`) into integer math without
 * losing precision.
 */
const STAKE_PRECISION = 10_000n;

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

/**
 * Preview (stake = tier 1..STARTERPACK_COUNT, may be fractional once the
 *   purchase boost is applied — e.g. tier 10 → 11): `tier × supplyMultiplier`.
 * In-game (stake = pre-computed `MULTIPLIER_PRECISION`-based value from the
 *   contract, e.g. ≥ 1_000_000): used as-is.
 *
 * The boundary is set at `MULTIPLIER_PRECISION / 2`: any preview tier
 * (including its boosted form) stays well below that, while any on-chain
 * stake is at least one full `MULTIPLIER_PRECISION` unit.
 */
function effectiveMultiplier(
  stake: number,
  supply: bigint,
  target: bigint,
): bigint {
  if (BigInt(Math.round(stake)) >= MULTIPLIER_PRECISION / 2n) {
    return BigInt(Math.round(stake));
  }
  const scaledStake = BigInt(Math.round(stake * Number(STAKE_PRECISION)));
  return (scaledStake * supplyMultiplier(supply, target)) / STAKE_PRECISION;
}

export function tokenPayout(
  score: number,
  stake: number,
  supply: bigint,
  target: bigint,
): bigint {
  return amount(score, effectiveMultiplier(stake, supply, target));
}

export function toTokens(rawAmount: bigint | number): number {
  return Number(rawAmount) / 10 ** TOKEN_DECIMALS;
}

/** Convert a USDC raw amount (6 decimals) to a USD `number`. */
export function toUsd(rawAmount: bigint | number): number {
  return Number(rawAmount) / 10 ** QUOTE_DECIMALS;
}

/** Tier price in USDC raw units: `stake * base_price`. */
export function tierPrice(stake: number): bigint {
  return BigInt(stake) * DEFAULT_ENTRY_PRICE;
}

/**
 * Reward boost applied at purchase time: the contract inflates the burn
 * amount by `stake%`, which translates into a `(1 + stake/100)` multiplier
 * on top of the base `stake` tier when computing rewards.
 *
 * Returns the boosted "real" multiplier used to draw the reward curve.
 * Example: `boostedMultiplier(3) = 3.09`.
 */
export function boostedMultiplier(stake: number): number {
  return stake * (1 + stake / 100);
}

/** Boost percentage label for tier `stake` (e.g. `3` → `"+3%"`). */
export function boostPercent(stake: number): number {
  return stake;
}

export const TIER_PRICES: bigint[] = Array.from(
  { length: STARTERPACK_COUNT },
  (_, i) => tierPrice(i + 1),
);

export function scoreRewards(
  stake: number,
  supply: bigint,
  target: bigint,
): number[] {
  const multiplier = effectiveMultiplier(stake, supply, target);
  const result: number[] = [];
  for (let s = 1; s <= MAX_SCORE; s++) {
    result.push(Number(amount(s, multiplier)));
  }
  return result;
}

export function maxPayout(
  stake: number,
  supply: bigint,
  target: bigint,
): bigint {
  return amount(MAX_SCORE, effectiveMultiplier(stake, supply, target));
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
