import { scoreRewards, toTokens } from "./payout";

export interface ChartCalculationParams {
  slotCount: number;
  currentSupply: bigint;
  targetSupply: bigint;
  /** Token price in USD (e.g., 0.0042). */
  tokenPrice: number;
  /** Play price in USD, used for break-even calculation. */
  playPrice: number;
  /** In gbomb domain this is the stake (1-STARTERPACK_COUNT). */
  multiplier: number;
}

export interface ChartCalculationResult {
  chartValues: number[];
  /** Break-even score (1-slotCount). */
  chartAbscissa: number;
  /** Maximum payout in USD. */
  maxPayout: number;
  /** Maximum payout in tokens (GLITCH). */
  maxPayoutTokens: number;
}

/**
 * Mirrors `nums/client/src/helpers/chart.ts`. In gbomb, `slotCount` is the
 * X-axis range (typically `MAX_SCORE`) and `multiplier` is the stake.
 */
export const ChartHelper = {
  calculate: (params: ChartCalculationParams): ChartCalculationResult => {
    const {
      slotCount,
      currentSupply,
      targetSupply,
      tokenPrice,
      playPrice,
      multiplier,
    } = params;

    if (targetSupply === 0n || currentSupply === 0n) {
      return {
        chartValues: Array.from({ length: slotCount }, () => 0),
        chartAbscissa: 0,
        maxPayout: 0,
        maxPayoutTokens: 0,
      };
    }

    const chartValues = scoreRewards(multiplier, currentSupply, targetSupply)
      .map(toTokens)
      .slice(0, slotCount);

    let chartAbscissa = slotCount;
    if (chartValues.length > 0) {
      const breakevenIndex = chartValues.findIndex(
        (reward) => reward * tokenPrice > playPrice,
      );
      chartAbscissa = breakevenIndex !== -1 ? breakevenIndex + 1 : slotCount;
    }

    const maxPayoutTokens = Math.max(...chartValues);
    const maxPayout = maxPayoutTokens * tokenPrice;

    return {
      chartValues,
      chartAbscissa,
      maxPayout,
      maxPayoutTokens,
    };
  },
};
