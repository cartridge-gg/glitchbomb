import {
  Bomb1xIcon,
  Bomb2xIcon,
  Bomb3xIcon,
  BombOrbIcon,
  CrossIcon,
  HeartIcon,
  OrbChipIcon,
  OrbMoonrockIcon,
  SparklesIcon,
  StickyBombIcon,
} from "@/components/icons";
import type { Orb } from "@/models";
import { OrbType } from "@/models/orb";

/** Get the icon component for an orb type */
export const getOrbIcon = (orb: Orb, useBombTierIcons?: boolean) => {
  if (orb.value === OrbType.StickyBomb) return StickyBombIcon;
  if (orb.isBomb()) {
    if (useBombTierIcons) {
      if (orb.value === OrbType.Bomb1) return Bomb1xIcon;
      if (orb.value === OrbType.Bomb2) return Bomb2xIcon;
      if (orb.value === OrbType.Bomb3) return Bomb3xIcon;
    }
    return BombOrbIcon;
  }
  if (orb.isPoint()) return SparklesIcon;
  if (orb.isMultiplier()) return CrossIcon;
  if (orb.isHealth()) return HeartIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return SparklesIcon;
};

/** Get CSS color for an orb type */
export const getOrbColor = (orb: Orb) => {
  if (orb.isBomb()) return "#FFFFFF";
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--orb-multiplier)";
  if (orb.isHealth()) return "var(--orb-heart)";
  if (orb.isChips()) return "var(--orb-chips)";
  if (orb.isMoonrock()) return "var(--orb-moonrock)";
  return "var(--green-400)";
};
