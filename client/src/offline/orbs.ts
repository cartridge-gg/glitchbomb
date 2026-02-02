import { Orb, OrbType } from "@/models/orb";
import { Random, shuffle } from "./random";

export const ORB_IDS = {
  None: 0,
  Bomb1: 1,
  Bomb2: 2,
  Bomb3: 3,
  Health1: 4,
  Health2: 5,
  Health3: 6,
  Multiplier50: 7,
  Multiplier100: 8,
  Multiplier150: 9,
  Point5: 10,
  Point6: 11,
  Point7: 12,
  Point8: 13,
  Point9: 14,
  PointOrb1: 15,
  PointBomb4: 16,
  Moonrock15: 17,
  Moonrock40: 18,
  Chips15: 19,
  CurseScoreDecrease: 20,
  StickyBomb: 21,
} as const;

const orbId = (type: OrbType) => new Orb(type).into();

export function initialOrbs(): number[] {
  return [
    orbId(OrbType.Bomb1),
    orbId(OrbType.Bomb1),
    orbId(OrbType.Bomb2),
    orbId(OrbType.Bomb3),
    orbId(OrbType.Point5),
    orbId(OrbType.Point5),
    orbId(OrbType.Point5),
    orbId(OrbType.Multiplier100),
    orbId(OrbType.PointOrb1),
    orbId(OrbType.PointBomb4),
    orbId(OrbType.Health1),
  ];
}

export function commonOrbs(): number[] {
  return [
    orbId(OrbType.Point5),
    orbId(OrbType.Chips15),
    orbId(OrbType.PointBomb4),
    orbId(OrbType.Point7),
    orbId(OrbType.Moonrock15),
    orbId(OrbType.Multiplier50),
    orbId(OrbType.Health1),
  ];
}

export function rareOrbs(): number[] {
  return [
    orbId(OrbType.Point8),
    orbId(OrbType.Point9),
    orbId(OrbType.Multiplier100),
    orbId(OrbType.Multiplier150),
  ];
}

export function cosmicOrbs(): number[] {
  return [orbId(OrbType.Moonrock40), orbId(OrbType.Health3)];
}

function drawUnique(source: number[], count: number, seed: bigint): number[] {
  const random = new Random(seed);
  const shuffled = shuffle(source, random);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function shopOrbs(seed: bigint): number[] {
  const commons = drawUnique(commonOrbs(), 3, seed);
  const rares = drawUnique(rareOrbs(), 2, seed);
  const cosmics = drawUnique(cosmicOrbs(), 1, seed);
  const combined = [...commons, ...rares, ...cosmics];
  const random = new Random(seed);
  return shuffle(combined, random);
}
