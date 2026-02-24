import type { RawOrbPulled } from "@/models";
import { Orb } from "./orb";

export const ORB_PULLED = "OrbPulled";

export class OrbPulled {
  game_id: number;
  id: number;
  orb: Orb;
  potential_moonrocks: number;

  constructor(
    game_id: number,
    id: number,
    orb: Orb,
    potential_moonrocks: number
  ) {
    this.game_id = game_id;
    this.id = id;
    this.orb = orb;
    this.potential_moonrocks = potential_moonrocks;
  }

  static getModelName(): string {
    return ORB_PULLED;
  }

  static from(data: RawOrbPulled): OrbPulled {
    return OrbPulled.parse(data);
  }

  static parse(data: RawOrbPulled): OrbPulled {
    const props = {
      game_id: Number(data.game_id.value),
      id: Number(data.id.value),
      orb: Orb.from(Number(data.orb.value)),
      potential_moonrocks: Number(data.potential_moonrocks?.value ?? 0),
    };
    return new OrbPulled(
      props.game_id,
      props.id,
      props.orb,
      props.potential_moonrocks
    );
  }

  static deduplicate(items: OrbPulled[]): OrbPulled[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.game_id === item.game_id && t.id === item.id)
    );
  }
}
