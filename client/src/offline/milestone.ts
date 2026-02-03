export function milestoneValue(level: number): number {
  switch (level) {
    case 1:
      return 12;
    case 2:
      return 18;
    case 3:
      return 28;
    case 4:
      return 44;
    case 5:
      return 70;
    case 6:
      return 100;
    case 7:
      return 150;
    default:
      return 0;
  }
}

export function milestoneCost(level: number): number {
  switch (level) {
    case 1:
      return 10;
    case 2:
      return 1;
    case 3:
      return 2;
    case 4:
      return 4;
    case 5:
      return 6;
    case 6:
      return 9;
    case 7:
      return 13;
    default:
      return 0;
  }
}
