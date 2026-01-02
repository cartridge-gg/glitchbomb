import type { BombDetails, DistributionValues } from "@/components/elements";
import { Packer } from "@/helpers/packer";
import type { RawGame } from "@/models";
import { Orb, OrbType } from "./orb";

export const GAME = "Game";

export class Game {
  pack_id: number;
  id: number;
  over: boolean;
  level: number;
  health: number;
  immunity: number;
  curses: number;
  points: number;
  milestone: number;
  multiplier: number;
  chips: number;
  discards: boolean[];
  bag: Orb[];
  shop: Orb[];
  pullables: Orb[];

  constructor(
    pack_id: number,
    id: number,
    over: boolean,
    level: number,
    health: number,
    immunity: number,
    curses: number,
    points: number,
    milestone: number,
    multiplier: number,
    chips: number,
    discards: boolean[],
    bag: Orb[],
    shop: Orb[],
    pullables: Orb[],
  ) {
    this.pack_id = pack_id;
    this.id = id;
    this.over = over;
    this.level = level;
    this.health = health;
    this.immunity = immunity;
    this.curses = curses;
    this.points = points;
    this.milestone = milestone;
    this.multiplier = multiplier;
    this.chips = chips;
    this.discards = discards;
    this.bag = bag;
    this.shop = shop;
    this.pullables = pullables;
  }

  static getModelName(): string {
    return GAME;
  }

  static from(data: RawGame): Game {
    return Game.parse(data);
  }

  static parse(data: RawGame): Game {
    const props = {
      pack_id: Number(data.pack_id.value),
      id: Number(data.id.value),
      over: data.over.value,
      level: Number(data.level.value),
      health: Number(data.health.value),
      immunity: Number(data.immunity.value),
      curses: Number(data.curses.value),
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
      shop: Packer.unpack(BigInt(data.shop.value), 5n).map((index) =>
        Orb.from(index),
      ),
    };
    // Computed fields
    // - pullables: corresponding to the bag without the discards
    const pullables = props.bag.filter((_orb, index) => !props.discards[index]);

    return new Game(
      props.pack_id,
      props.id,
      props.over,
      props.level,
      props.health,
      props.immunity,
      props.curses,
      props.points,
      props.milestone,
      props.multiplier,
      props.chips,
      props.discards,
      props.bag,
      props.shop,
      pullables,
    );
  }

  static deduplicate(items: Game[]): Game[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.pack_id === item.pack_id && t.id === item.id),
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
      chips: this.pullables.filter((orb) => orb.isChips()).length,
      moonrocks: this.pullables.filter((orb) => orb.isMoonrock()).length,
    };
  }
}
