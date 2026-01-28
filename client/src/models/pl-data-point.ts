import type { RawPLDataPoint } from "./index";

export const PL_DATA_POINT = "PLDataPoint";

export class PLDataPoint {
  packId: bigint;
  gameId: number;
  id: number;
  potentialMoonrocks: number;
  orb: number;

  constructor(
    packId: bigint,
    gameId: number,
    id: number,
    potentialMoonrocks: number,
    orb: number,
  ) {
    this.packId = packId;
    this.gameId = gameId;
    this.id = id;
    this.potentialMoonrocks = potentialMoonrocks;
    this.orb = orb;
  }

  /**
   * Map orb type to graph color variant based on contracts/src/types/orb.cairo
   * Orb type mappings:
   *   0 = non-orb (level cost)
   *   1-3 = Bomb1-3 (red)
   *   4-6 = Health1-3 (green)
   *   7-9 = Multiplier50/100/150 (yellow)
   *   10-16 = Point orbs (green)
   *   17-18 = Moonrock15/40 (blue)
   *   19 = Chips15 (yellow)
   *   20 = CurseScoreDecrease (red)
   *   21 = StickyBomb (red)
   */
  variant(): "green" | "red" | "yellow" | "blue" {
    const orbType = this.orb;

    // Non-orb events (level cost, game start)
    if (orbType === 0) {
      return "green";
    }

    // Bombs (1-3, 21) - red
    if ((orbType >= 1 && orbType <= 3) || orbType === 21) {
      return "red";
    }

    // Health (4-6) - green
    if (orbType >= 4 && orbType <= 6) {
      return "green";
    }

    // Multipliers (7-9) - yellow
    if (orbType >= 7 && orbType <= 9) {
      return "yellow";
    }

    // Points (10-16) - green
    if (orbType >= 10 && orbType <= 16) {
      return "green";
    }

    // Moonrocks (17-18) - blue
    if (orbType >= 17 && orbType <= 18) {
      return "blue";
    }

    // Chips (19) - yellow
    if (orbType === 19) {
      return "yellow";
    }

    // CurseScoreDecrease (20) - red
    if (orbType === 20) {
      return "red";
    }

    // Default fallback
    return "green";
  }

  static parse(data: RawPLDataPoint): PLDataPoint {
    const props = {
      packId: BigInt(data.pack_id?.value ?? 0),
      gameId: Number(data.game_id?.value ?? 0),
      id: Number(data.id?.value ?? 0),
      potentialMoonrocks: Number(data.potential_moonrocks?.value ?? 0),
      orb: Number(data.orb?.value ?? 0),
    };
    return new PLDataPoint(
      props.packId,
      props.gameId,
      props.id,
      props.potentialMoonrocks,
      props.orb,
    );
  }

  static getModelName(): string {
    return PL_DATA_POINT;
  }

  static deduplicate(points: PLDataPoint[]): PLDataPoint[] {
    const seen = new Set<string>();
    return points.filter((point) => {
      const key = `${point.packId}-${point.gameId}-${point.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
