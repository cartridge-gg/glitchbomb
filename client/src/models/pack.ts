import type { RawPack } from "@/models";

export const PACK = "Pack";

export class Pack {
  id: number;
  game_count: number;
  moonrocks: number;

  constructor(id: number, game_count: number, moonrocks: number) {
    this.id = id;
    this.game_count = game_count;
    this.moonrocks = moonrocks;
  }

  static getModelName(): string {
    return PACK;
  }

  static from(data: RawPack): Pack {
    return Pack.parse(data);
  }

  static parse(data: RawPack): Pack {
    const props = {
      id: Number(data.id.value),
      game_count: Number(data.game_count.value),
      moonrocks: Number(data.moonrocks.value),
    };
    return new Pack(props.id, props.game_count, props.moonrocks);
  }

  static deduplicate(items: Pack[]): Pack[] {
    return items.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }
}
