export const NAMESPACE = "GLITCHBOMB";

export const ENTRY_PRICE = 100;

export interface PayoutTier {
  minMoonrocks: number;
  payout: number;
  label: string;
}

export const PAYOUT_TIERS: PayoutTier[] = [
  { minMoonrocks: 100, payout: 5, label: "100+" },
  { minMoonrocks: 200, payout: 25, label: "200+" },
  { minMoonrocks: 300, payout: 100, label: "300+" },
  { minMoonrocks: 400, payout: 400, label: "400+" },
  { minMoonrocks: 500, payout: 1600, label: "500+" },
];

export const BREAK_EVEN_TIER = 300;
export const MAX_REWARD = 1600;

export function getPayoutForMoonrocks(moonrocks: number): number {
  for (let i = PAYOUT_TIERS.length - 1; i >= 0; i--) {
    if (moonrocks >= PAYOUT_TIERS[i].minMoonrocks) {
      return PAYOUT_TIERS[i].payout;
    }
  }
  return 0;
}
