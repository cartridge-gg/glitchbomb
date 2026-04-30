import type { BombDetails } from "@/components/containers";
import type { DistributionValues } from "@/components/elements";
import { Packer } from "@/helpers/packer";
import type { RawGame } from "@/models";
import { Orb, OrbType } from "./orb";

const MODEL_NAME = "Game";

/**
 * Mirrors the on-chain `Game` struct in `contracts/src/models/index.cairo`.
 * Field order matches the Cairo source. Packed fields (`bag`, `shop`,
 * `discards`) are exposed as parsed views (`Orb[]` / `boolean[]`) — the raw
 * packed integers are not retained. `pullables` and `shopPurchaseCounts` are
 * computed views derived at parse time.
 */
export class Game {
  constructor(
    public id: number,
    public claimed: boolean,
    public level: number,
    public health: number,
    public immunity: number,
    public curses: number,
    public pull_count: number,
    public points: number,
    public milestone: number,
    /** Multiplier scaled to 1.0 (raw u16 value / 100). */
    public multiplier: number,
    public chips: number,
    public moonrocks: number,
    /** Unix timestamp at which the game ended; 0 = still in progress. */
    public over: number,
    /** Unix timestamp at which the game expires; 0 = not yet started. */
    public expiration: number,
    public discards: boolean[],
    public shop: Orb[],
    public stake: number,
    public level_counters: bigint,
    public counters: bigint,
    public bag: Orb[],
    public supply: bigint,
    public price: bigint,
    public shopPurchaseCounts: number[],
    public pullables: Orb[],
  ) {}

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawGame): Game {
    return Game.parse(data);
  }

  static parse(data: RawGame): Game {
    const discards = Packer.unpack(BigInt(data.discards.value), 1n).map(
      (index) => index === 1,
    );
    const bag = Packer.unpack(BigInt(data.bag.value), 5n).map((index) =>
      Orb.from(index),
    );
    const shopValue = BigInt(data.shop.value);
    const shop = Packer.unpack(shopValue & 0x3fffffffn, 5n, 6).map((index) =>
      Orb.from(index),
    );
    const shopPurchaseCounts = Game.parsePurchaseCounts(shopValue);
    const pullables = bag.filter((_orb, index) => !discards[index]);

    return new Game(
      Number(data.id.value),
      !!data.claimed.value,
      Number(data.level.value),
      Number(data.health.value),
      Number(data.immunity.value),
      Number(data.curses.value),
      Number(data.pull_count.value),
      Number(data.points.value),
      Number(data.milestone.value),
      Number(data.multiplier.value) / 100,
      Number(data.chips.value),
      Number(data.moonrocks.value),
      Number(data.over.value),
      Number(data.expiration.value),
      discards,
      shop,
      Number(data.stake.value),
      BigInt(data.level_counters.value),
      BigInt(data.counters.value),
      bag,
      BigInt(data.supply.value),
      BigInt(data.price.value),
      shopPurchaseCounts,
      pullables,
    );
  }

  /** Extracts persistent purchase counters from the shop u128: 22 orb types × 3 bits each, starting at bit 32. */
  static parsePurchaseCounts(shopValue: bigint): number[] {
    const PURCHASE_OFFSET = 32n;
    const BITS_PER_PURCHASE = 3n;
    const NUM_ORB_TYPES = 22;
    const mask = (1n << BITS_PER_PURCHASE) - 1n;
    const counts: number[] = [];
    for (let i = 0; i < NUM_ORB_TYPES; i++) {
      const offset = PURCHASE_OFFSET + BigInt(i) * BITS_PER_PURCHASE;
      counts.push(Number((shopValue >> offset) & mask));
    }
    return counts;
  }

  static deduplicate(items: Game[]): Game[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }

  bombs(): BombDetails {
    return {
      simple: {
        total: this.bag.filter((orb) => orb.value === OrbType.Bomb1).length,
        count: this.pullables.filter((orb) => orb.value === OrbType.Bomb1)
          .length,
      },
      double: {
        total: this.bag.filter((orb) => orb.value === OrbType.Bomb2).length,
        count: this.pullables.filter((orb) => orb.value === OrbType.Bomb2)
          .length,
      },
      triple: {
        total: this.bag.filter((orb) => orb.value === OrbType.Bomb3).length,
        count: this.pullables.filter((orb) => orb.value === OrbType.Bomb3)
          .length,
      },
    };
  }

  distribution(): DistributionValues {
    return {
      bombs: this.pullables.filter((orb) => orb.isBomb()).length,
      points: this.pullables.filter((orb) => orb.isPoint()).length,
      multipliers: this.pullables.filter((orb) => orb.isMultiplier()).length,
      health: this.pullables.filter((orb) => orb.isHealth()).length,
      special: this.pullables.filter((orb) => orb.isChips() || orb.isMoonrock())
        .length,
    };
  }
}
