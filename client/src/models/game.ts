import { Packer } from "@/helpers/packer";
import type { RawGame } from "@/models";
import { Orb } from "./orb";

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
  discards: number;
  bag: Orb[];
  shop: Orb[];

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
    discards: number,
    bag: Orb[],
    shop: Orb[],
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
      multiplier: Number(data.multiplier.value),
      chips: Number(data.chips.value),
      discards: Number(data.discards.value),
      bag: Packer.unpack(BigInt(data.bag.value), 5n).map((index) =>
        Orb.from(index),
      ),
      shop: Packer.unpack(BigInt(data.shop.value), 5n).map((index) =>
        Orb.from(index),
      ),
    };
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
    );
  }

  static deduplicate(items: Game[]): Game[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.pack_id === item.pack_id && t.id === item.id),
    );
  }
}
