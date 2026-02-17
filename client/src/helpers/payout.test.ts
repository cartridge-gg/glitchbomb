import { cashOutPayout } from "./payout";

describe("cashOutPayout", () => {
  it("returns expected values at tier boundaries", () => {
    expect(cashOutPayout(0)).toBe(0);
    expect(cashOutPayout(60)).toBe(60);
    expect(cashOutPayout(61)).toBe(61);
    expect(cashOutPayout(120)).toBe(111);
    expect(cashOutPayout(121)).toBe(112);
    expect(cashOutPayout(200)).toBe(167);
    expect(cashOutPayout(201)).toBe(168);
  });
});
