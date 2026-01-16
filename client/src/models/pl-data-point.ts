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
   * Map orb type to graph color variant
   * orb: 0 = non-orb events (level cost), otherwise orb type
   */
  variant(): "green" | "red" | "yellow" | "blue" {
    // Orb types from contracts/src/types/orb.cairo
    // 0 = non-orb (level cost), use green
    // Bomb types are typically in ranges that indicate damage
    // We'll need to check the actual orb type ranges

    if (this.orb === 0) {
      return "green"; // Level cost / baseline events
    }

    // Based on orb.cairo enum values:
    // Bombs are typically variant 1-5 range (red)
    // Points are typically lower numbered (green)
    // Multipliers are higher numbered (yellow)
    // Moonrocks are specific types (blue)

    // Simplified mapping based on orb.variant() logic from Orb class
    // This should match the Orb class variant method
    const orbType = this.orb;

    // Bomb1-5 are orb types 1-5
    if (orbType >= 1 && orbType <= 5) {
      return "red"; // Bombs
    }

    // Moonrock orbs (check specific type)
    if (orbType >= 26 && orbType <= 30) {
      return "blue"; // Moonrock orbs
    }

    // Multiplier orbs
    if (orbType >= 21 && orbType <= 25) {
      return "yellow"; // Multiplier orbs
    }

    // Default to green for point orbs, health, chips, etc.
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
