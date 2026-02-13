import type { RawPack } from "@/models";

export const PACK = "Pack";

export class Pack {
  id: number;
  game_count: number;
  moonrocks: number;
  entry_cost: number;
  updated_at: number;

  constructor(
    id: number,
    game_count: number,
    moonrocks: number,
    entry_cost: number,
    updated_at = 0,
  ) {
    this.id = id;
    this.game_count = game_count;
    this.moonrocks = moonrocks;
    this.entry_cost = entry_cost;
    this.updated_at = updated_at;
  }

  static getModelName(): string {
    return PACK;
  }

  static from(data: RawPack): Pack {
    return Pack.parse(data);
  }

  static parse(data: RawPack, updated_at = 0): Pack {
    const props = {
      id: Number(data.id.value),
      game_count: Number(data.game_count.value),
      moonrocks: Number(data.moonrocks.value),
      entry_cost: Number(data.entry_cost?.value ?? 2),
    };
    return new Pack(
      props.id,
      props.game_count,
      props.moonrocks,
      props.entry_cost,
      updated_at,
    );
  }

  static deduplicate(items: Pack[]): Pack[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}
