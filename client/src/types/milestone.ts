export const Milestone = {
  get(level: number): number {
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
  },

  cost(level: number): number {
    return Math.floor((level * (2 * level + 1)) / 8);
  },
};
