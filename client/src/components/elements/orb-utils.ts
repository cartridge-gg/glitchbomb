import {
  Bomb1xIcon,
  Bomb2xIcon,
  Bomb3xIcon,
  BombOrbIcon,
  OrbChipIcon,
  OrbHealthIcon,
  OrbMoonrockIcon,
  OrbMultiplierIcon,
  OrbPointIcon,
} from "@/components/icons";
import type { Orb } from "@/models";
import { OrbType } from "@/models/orb";

/** Get the icon component for an orb type */
export const getOrbIcon = (orb: Orb, useBombTierIcons?: boolean) => {
  if (orb.isBomb()) {
    if (useBombTierIcons) {
      if (orb.value === OrbType.Bomb1) return Bomb1xIcon;
      if (orb.value === OrbType.Bomb2) return Bomb2xIcon;
      if (orb.value === OrbType.Bomb3) return Bomb3xIcon;
    }
    return BombOrbIcon;
  }
  if (orb.isPoint()) return OrbPointIcon;
  if (orb.isMultiplier()) return OrbMultiplierIcon;
  if (orb.isHealth()) return OrbHealthIcon;
  if (orb.isChips()) return OrbChipIcon;
  if (orb.isMoonrock()) return OrbMoonrockIcon;
  return OrbPointIcon;
};

/** Get CSS color for an orb type */
export const getOrbColor = (orb: Orb) => {
  if (orb.isBomb()) return "var(--red-100)";
  if (orb.isPoint()) return "var(--green-400)";
  if (orb.isMultiplier()) return "var(--orb-multiplier)";
  if (orb.isHealth()) return "var(--orb-heart)";
  if (orb.isChips()) return "var(--orb-chips)";
  if (orb.isMoonrock()) return "var(--orb-moonrock)";
  return "var(--green-400)";
};
