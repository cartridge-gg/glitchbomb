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
