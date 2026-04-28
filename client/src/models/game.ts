import type { BombDetails, DistributionValues } from "@/components/elements";
import { DEFAULT_EXPIRATION } from "@/constants";
import { Packer } from "@/helpers/packer";
import type { RawGame } from "@/models";
import { Orb, OrbType } from "./orb";

const MODEL_NAME = "Game";

export class Game {
  constructor(
    public id: number,
    public over: boolean,
    public level: number,
    public health: number,
    public immunity: number,
    public curses: number,
    public pull_count: number,
    public points: number,
    public milestone: number,
    public multiplier: number,
    public chips: number,
    public discards: boolean[],
    public bag: Orb[],
    public shop: Orb[],
    public shopPurchaseCounts: number[],
    public pullables: Orb[],
    public moonrocks: number,
    public stake: number,
    public created_at: number,
  ) {
    this.id = id;
    this.over = over;
    this.level = level;
    this.health = health;
    this.immunity = immunity;
    this.curses = curses;
    this.pull_count = pull_count;
    this.points = points;
    this.milestone = milestone;
    this.multiplier = multiplier;
    this.chips = chips;
    this.discards = discards;
    this.bag = bag;
    this.shop = shop;
    this.shopPurchaseCounts = shopPurchaseCounts;
    this.pullables = pullables;
    this.moonrocks = moonrocks;
    this.stake = stake;
    this.created_at = created_at;
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static from(data: RawGame): Game {
    return Game.parse(data);
  }

  static parse(data: RawGame): Game {
    const overValue = BigInt(data.over.value);
    const expiration = Number(data.expiration.value);
    const props = {
      id: Number(data.id.value),
      over: overValue !== 0n,
      level: Number(data.level.value),
      health: Number(data.health.value),
      immunity: Number(data.immunity.value),
      curses: Number(data.curses.value),
      pull_count: Number(data.pull_count.value),
      points: Number(data.points.value),
      milestone: Number(data.milestone.value),
      multiplier: Number(data.multiplier.value) / 100,
      chips: Number(data.chips.value),
      discards: Packer.unpack(BigInt(data.discards.value), 1n).map(
        (index) => index === 1,
      ),
      bag: Packer.unpack(BigInt(data.bag.value), 5n).map((index) =>
        Orb.from(index),
      ),
      shop: Packer.unpack(BigInt(data.shop.value) & 0x3fffffffn, 5n, 6).map(
        (index) => Orb.from(index),
      ),
      shopPurchaseCounts: Game.parsePurchaseCounts(BigInt(data.shop.value)),
      moonrocks: Number(data.moonrocks.value),
      stake: Number(data.stake.value),
      created_at: expiration > 0 ? expiration - DEFAULT_EXPIRATION : 0,
    };
    // Computed fields
    // - pullables: corresponding to the bag without the discards
    const pullables = props.bag.filter((_orb, index) => !props.discards[index]);

    return new Game(
      props.id,
      props.over,
      props.level,
      props.health,
      props.immunity,
      props.curses,
      props.pull_count,
      props.points,
      props.milestone,
      props.multiplier,
      props.chips,
      props.discards,
      props.bag,
      props.shop,
      props.shopPurchaseCounts,
      pullables,
      props.moonrocks,
      props.stake,
      props.created_at,
    );
  }

  // Extract purchase counts from shop u128 (bits 32-91, 20 types × 3 bits each)
  static parsePurchaseCounts(shopValue: bigint): number[] {
    const PURCHASE_OFFSET = 32n;
    const BITS_PER_PURCHASE = 3n;
    const NUM_ORB_TYPES = 22; // 0-21 (None through StickyBomb)
    const mask = (1n << BITS_PER_PURCHASE) - 1n; // 0x7
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
