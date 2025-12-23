// Orb enum matching contracts/src/types/orb.cairo
export enum OrbType {
  None = "None",
  Bomb1 = "Bomb1",
  Bomb2 = "Bomb2",
  Bomb3 = "Bomb3",
  Health1 = "Health1",
  Health2 = "Health2",
  Health3 = "Health3",
  Multiplier50 = "Multiplier50",
  Multiplier100 = "Multiplier100",
  Multiplier150 = "Multiplier150",
  Point5 = "Point5",
  Point6 = "Point6",
  Point7 = "Point7",
  Point8 = "Point8",
  Point9 = "Point9",
  PointOrb1 = "PointOrb1",
  PointBomb4 = "PointBomb4",
  Moonrock15 = "Moonrock15",
  Moonrock40 = "Moonrock40",
  Chips15 = "Chips15",
  CurseScoreDecrease = "CurseScoreDecrease",
}

export const ORB_COUNT = 20;

export class Orb {
  value: OrbType;

  constructor(value: OrbType) {
    this.value = value;
  }

  public into(): number {
    switch (this.value) {
      case OrbType.None:
        return 0;
      case OrbType.Bomb1:
        return 1;
      case OrbType.Bomb2:
        return 2;
      case OrbType.Bomb3:
        return 3;
      case OrbType.Health1:
        return 4;
      case OrbType.Health2:
        return 5;
      case OrbType.Health3:
        return 6;
      case OrbType.Multiplier50:
        return 7;
      case OrbType.Multiplier100:
        return 8;
      case OrbType.Multiplier150:
        return 9;
      case OrbType.Point5:
        return 10;
      case OrbType.Point6:
        return 11;
      case OrbType.Point7:
        return 12;
      case OrbType.Point8:
        return 13;
      case OrbType.Point9:
        return 14;
      case OrbType.PointOrb1:
        return 15;
      case OrbType.PointBomb4:
        return 16;
      case OrbType.Moonrock15:
        return 17;
      case OrbType.Moonrock40:
        return 18;
      case OrbType.Chips15:
        return 19;
      case OrbType.CurseScoreDecrease:
        return 20;
      default:
        return 0;
    }
  }

  public static from(index: number): Orb {
    const types = Object.values(OrbType);
    return new Orb(types[index] || OrbType.None);
  }

  public isNone(): boolean {
    return this.value === OrbType.None;
  }

  public index(): number {
    return this.into();
  }

  public name(): string {
    switch (this.value) {
      case OrbType.Bomb1:
        return "Bomb";
      case OrbType.Bomb2:
        return "Double Bomb";
      case OrbType.Bomb3:
        return "Triple Bomb";
      case OrbType.Health1:
        return "Health";
      case OrbType.Health2:
        return "Double Health";
      case OrbType.Health3:
        return "Triple Health";
      case OrbType.Multiplier50:
        return "Multiplier 50";
      case OrbType.Multiplier100:
        return "Multiplier 100";
      case OrbType.Multiplier150:
        return "Multiplier 150";
      case OrbType.Point5:
        return "Point 5";
      case OrbType.Point6:
        return "Point 6";
      case OrbType.Point7:
        return "Point 7";
      case OrbType.Point8:
        return "Point 8";
      case OrbType.Point9:
        return "Point 9";
      case OrbType.PointOrb1:
        return "Point Orb 1";
      case OrbType.PointBomb4:
        return "Point Bomb 4";
      case OrbType.Moonrock15:
        return "Moonrock 15";
      case OrbType.Moonrock40:
        return "Moonrock 40";
      case OrbType.Chips15:
        return "Chips 15";
      case OrbType.CurseScoreDecrease:
        return "Curse Score Decrease";
      default:
        return "";
    }
  }

  public color(): string {
    switch (this.value) {
      case OrbType.Bomb1:
        return "#FF6B6B";
      case OrbType.Bomb2:
        return "#4ECDC4";
      case OrbType.Bomb3:
        return "#45B7D1";
      case OrbType.Health1:
        return "#FFA07A";
      case OrbType.Health2:
        return "#98D8C8";
      case OrbType.Health3:
        return "#F7DC6F";
      case OrbType.Multiplier50:
        return "#BB8FCE";
      case OrbType.Multiplier100:
        return "#F39C12";
      case OrbType.Multiplier150:
        return "#52C97E";
      case OrbType.Point5:
        return "#E74C3C";
      case OrbType.Point6:
        return "#3498DB";
      case OrbType.Point7:
        return "#9B59B6";
      case OrbType.Point8:
        return "#1ABC9C";
      case OrbType.Point9:
        return "#E67E22";
      case OrbType.PointOrb1:
        return "#95A5A6";
      case OrbType.PointBomb4:
        return "#2E8B57";
      case OrbType.Moonrock15:
        return "#8B0000";
      case OrbType.Moonrock40:
        return "#8B0000";
      case OrbType.Chips15:
        return "#2E8B57";
      case OrbType.CurseScoreDecrease:
        return "#95A5A6";
      default:
        return "#95A5A6";
    }
  }
}
