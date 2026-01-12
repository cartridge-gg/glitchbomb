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

  public isBomb(): boolean {
    return (
      this.value === OrbType.Bomb1 ||
      this.value === OrbType.Bomb2 ||
      this.value === OrbType.Bomb3
    );
  }

  public isHealth(): boolean {
    return (
      this.value === OrbType.Health1 ||
      this.value === OrbType.Health2 ||
      this.value === OrbType.Health3
    );
  }

  public isMultiplier(): boolean {
    return (
      this.value === OrbType.Multiplier50 ||
      this.value === OrbType.Multiplier100 ||
      this.value === OrbType.Multiplier150
    );
  }

  public isPoint(): boolean {
    return (
      this.value === OrbType.Point5 ||
      this.value === OrbType.Point6 ||
      this.value === OrbType.Point7 ||
      this.value === OrbType.Point8 ||
      this.value === OrbType.Point9 ||
      this.value === OrbType.PointOrb1 ||
      this.value === OrbType.PointBomb4
    );
  }

  public isMoonrock(): boolean {
    return (
      this.value === OrbType.Moonrock15 || this.value === OrbType.Moonrock40
    );
  }

  public isChips(): boolean {
    return this.value === OrbType.Chips15;
  }

  public isCurse(): boolean {
    return this.value === OrbType.CurseScoreDecrease;
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
        return "Multiplier 50%";
      case OrbType.Multiplier100:
        return "Multiplier 100%";
      case OrbType.Multiplier150:
        return "Multiplier 150%";
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

  public description(): string {
    switch (this.value) {
      case OrbType.Bomb1:
        return "Lose 1 health point.";
      case OrbType.Bomb2:
        return "Lose 2 health points.";
      case OrbType.Bomb3:
        return "Lose 3 health points.";
      case OrbType.Health1:
        return "Restore 1 health point.";
      case OrbType.Health2:
        return "Restore 2 health points.";
      case OrbType.Health3:
        return "Restore 3 health points.";
      case OrbType.Multiplier50:
        return "Boost your score by 50%.";
      case OrbType.Multiplier100:
        return "Boost your score by 100%.";
      case OrbType.Multiplier150:
        return "Boost your score by 150%.";
      case OrbType.Point5:
        return "Earn 5 points.";
      case OrbType.Point6:
        return "Earn 6 points.";
      case OrbType.Point7:
        return "Earn 7 points.";
      case OrbType.Point8:
        return "Earn 8 points.";
      case OrbType.Point9:
        return "Earn 9 points.";
      case OrbType.PointOrb1:
        return "Earn 1 point for each orb previously pulled.";
      case OrbType.PointBomb4:
        return "Earn 4 points for each bomb previously pulled.";
      case OrbType.Moonrock15:
        return "Earn 15 Moonrocks.";
      case OrbType.Moonrock40:
        return "Earn 40 Moonrocks.";
      case OrbType.Chips15:
        return "Earn 15 Chips.";
      case OrbType.CurseScoreDecrease:
        return "Lose 20% of your score.";
      default:
        return "";
    }
  }

  public cost(): number {
    switch (this.value) {
      case OrbType.Health1:
        return 9;
      case OrbType.Health3:
        return 21;
      case OrbType.Multiplier50:
        return 9;
      case OrbType.Multiplier100:
        return 14;
      case OrbType.Multiplier150:
        return 16;
      case OrbType.Point5:
        return 5;
      case OrbType.Point6:
        return 6;
      case OrbType.Point7:
        return 7;
      case OrbType.Point8:
        return 8;
      case OrbType.Point9:
        return 9;
      case OrbType.PointOrb1:
        return 1;
      case OrbType.PointBomb4:
        return 6;
      case OrbType.Moonrock15:
        return 8;
      case OrbType.Moonrock40:
        return 23;
      case OrbType.Chips15:
        return 5;
      default:
        return 0;
    }
  }

  public variant():
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "blue"
    | "default"
    | "salmon" {
    switch (this.value) {
      case OrbType.Bomb1:
        return "red";
      case OrbType.Bomb2:
        return "red";
      case OrbType.Bomb3:
        return "red";
      case OrbType.Health1:
        return "salmon";
      case OrbType.Health2:
        return "salmon";
      case OrbType.Health3:
        return "salmon";
      case OrbType.Multiplier50:
        return "yellow";
      case OrbType.Multiplier100:
        return "yellow";
      case OrbType.Multiplier150:
        return "yellow";
      case OrbType.Point5:
        return "green";
      case OrbType.Point6:
        return "green";
      case OrbType.Point7:
        return "green";
      case OrbType.Point8:
        return "green";
      case OrbType.Point9:
        return "green";
      case OrbType.PointOrb1:
        return "green";
      case OrbType.PointBomb4:
        return "green";
      case OrbType.Moonrock15:
        return "blue";
      case OrbType.Moonrock40:
        return "blue";
      case OrbType.Chips15:
        return "orange";
      default:
        return "default";
    }
  }

  public rarity(): "common" | "rare" | "cosmic" {
    const cost = this.cost();
    if (cost >= 21) return "cosmic";
    if (cost >= 14) return "rare";
    return "common";
  }

  public color(): string {
    switch (this.value) {
      case OrbType.Bomb1:
        return "var(--red-100)";
      case OrbType.Bomb2:
        return "var(--red-100)";
      case OrbType.Bomb3:
        return "var(--red-100)";
      case OrbType.Health1:
        return "var(--salmon-100)";
      case OrbType.Health2:
        return "var(--salmon-100)";
      case OrbType.Health3:
        return "var(--salmon-100)";
      case OrbType.Multiplier50:
        return "var(--yellow-100)";
      case OrbType.Multiplier100:
        return "var(--yellow-100)";
      case OrbType.Multiplier150:
        return "var(--yellow-100)";
      case OrbType.Point5:
        return "var(--green-400)";
      case OrbType.Point6:
        return "var(--green-400)";
      case OrbType.Point7:
        return "var(--green-400)";
      case OrbType.Point8:
        return "var(--green-400)";
      case OrbType.Point9:
        return "var(--green-400)";
      case OrbType.PointOrb1:
        return "var(--green-400)";
      case OrbType.PointBomb4:
        return "var(--green-400)";
      case OrbType.Moonrock15:
        return "var(--blue-100)";
      case OrbType.Moonrock40:
        return "var(--blue-100)";
      case OrbType.Chips15:
        return "var(--orange-100)";
      default:
        return "var(--white-100)";
    }
  }
}
