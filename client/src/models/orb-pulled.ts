import type { RawOrbPulled } from "@/models";
import { Orb } from "./orb";

export const ORB_PULLED = "OrbPulled";

export class OrbPulled {
  pack_id: number;
  game_id: number;
  id: number;
  orb: Orb;
  potential_moonrocks: number; // pack.moonrocks + game.points (what you'd cash out)

  constructor(
    pack_id: number,
    game_id: number,
    id: number,
    orb: Orb,
    potential_moonrocks: number,
  ) {
    this.pack_id = pack_id;
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
      pack_id: Number(data.pack_id.value),
      game_id: Number(data.game_id.value),
      id: Number(data.id.value),
      orb: Orb.from(Number(data.orb.value)),
      potential_moonrocks: Number(data.potential_moonrocks?.value ?? 0),
    };
    return new OrbPulled(
      props.pack_id,
      props.game_id,
      props.id,
      props.orb,
      props.potential_moonrocks,
    );
  }

  static deduplicate(items: OrbPulled[]): OrbPulled[] {
    return items.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.pack_id === item.pack_id &&
            t.game_id === item.game_id &&
            t.id === item.id,
        ),
    );
  }
}
