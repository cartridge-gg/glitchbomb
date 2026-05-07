import type { RawMarker } from "./index";

const MODEL_NAME = "Marker";

/**
 * Mirror of the contract's `Marker` event (`contracts/src/events/index.cairo`).
 * One Marker is emitted per orb pull and per level transition (and once
 * for the game-start baseline). The `id` follows the band-based layout
 * defined in `contracts/src/models/game.cairo`: every level owns a
 * disjoint band of 1024 ids (lower half = pulls, upper half = level
 * markers). The baseline uses the special id `0`.
 */
export class Marker {
  gameId: bigint;
  id: number;
  potentialMoonrocks: number;
  orb: number;

  constructor(
    gameId: bigint,
    id: number,
    potentialMoonrocks: number,
    orb: number,
  ) {
    this.gameId = gameId;
    this.id = id;
    this.potentialMoonrocks = potentialMoonrocks;
    this.orb = orb;
  }

  /** Game-start baseline marker (id=0). */
  isBaseline(): boolean {
    return this.id === 0;
  }

  /** Level transition marker (orb=0 and not baseline). */
  isLevelMarker(): boolean {
    return this.orb === 0 && this.id !== 0;
  }

  /** Orb pull marker (orb>0). */
  isPullMarker(): boolean {
    return this.orb !== 0;
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
  variant(): "green" | "red" | "yellow" | "blue" | "pink" {
    const orbType = this.orb;

    // Non-orb events (level cost, game start)
    if (orbType === 0) {
      return "yellow";
    }

    // Bombs (1-3, 21) - red
    if ((orbType >= 1 && orbType <= 3) || orbType === 21) {
      return "red";
    }

    // Health (4-6) - pink
    if (orbType >= 4 && orbType <= 6) {
      return "pink";
    }

    // Multipliers (7-9) - blue
    if (orbType >= 7 && orbType <= 9) {
      return "blue";
    }

    // Points (10-16) - green
    if (orbType >= 10 && orbType <= 16) {
      return "green";
    }

    // Moonrocks (17-18) - blue
    if (orbType >= 17 && orbType <= 18) {
      return "blue";
    }

    // Chips (19) - blue (renders as purple, matching --orb-chips)
    if (orbType === 19) {
      return "blue";
    }

    // CurseScoreDecrease (20) - red
    if (orbType === 20) {
      return "red";
    }

    // Default fallback
    return "green";
  }

  static parse(data: RawMarker): Marker {
    const props = {
      gameId: BigInt(data.game_id?.value ?? 0),
      id: Number(data.id?.value ?? 0),
      potentialMoonrocks: Number(data.potential_moonrocks?.value ?? 0),
      orb: Number(data.orb?.value ?? 0),
    };
    return new Marker(
      props.gameId,
      props.id,
      props.potentialMoonrocks,
      props.orb,
    );
  }

  static getModelName(): string {
    return MODEL_NAME;
  }

  static deduplicate(markers: Marker[]): Marker[] {
    const seen = new Set<string>();
    return markers.filter((marker) => {
      const key = `${marker.gameId}-${marker.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
