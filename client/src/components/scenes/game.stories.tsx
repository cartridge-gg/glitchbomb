import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { OrbOutcome } from "@/components/containers";
import type { GameChartDataPoint } from "@/components/elements";
import { Orb, type OrbPulled, OrbType } from "@/models";
import { GameScene, type GameSceneGame } from "./game";

const createMockOrb = (value: string): OrbPulled["orb"] => {
  const isPoint =
    value.startsWith("Point") ||
    value === "PointOrb1" ||
    value === "PointBomb4";
  const isMultiplier = value.startsWith("Multiplier");
  const isBomb = value.startsWith("Bomb");
  const isHealth = value.startsWith("Health");
  const isMoonrock = value.startsWith("Moonrock");
  const isChips = value.startsWith("Chips");
  const isCurse = value.startsWith("Curse");
  const logCategory = isPoint
    ? "POINTS"
    : isMultiplier
      ? "MULTIPLIER"
      : isBomb
        ? "BOMB"
        : isHealth
          ? "HEALTH"
          : isMoonrock
            ? "MOONROCK"
            : isChips
              ? "CHIPS"
              : isCurse
                ? "CURSE"
                : "SPECIAL";
  const color = isBomb
    ? "#FFFFFF"
    : isHealth
      ? "var(--orb-heart)"
      : isMultiplier
        ? "var(--orb-multiplier)"
        : isPoint
          ? "var(--green-100)"
          : isMoonrock
            ? "var(--orb-moonrock)"
            : isChips
              ? "var(--orb-chips)"
              : "var(--white-100)";
  return {
    value,
    name: () => value,
    color: () => color,
    logCategory: () => logCategory,
    logEffect: () => value.toUpperCase(),
    isPoint: () => isPoint,
    isMultiplier: () => isMultiplier,
    isBomb: () => isBomb,
    isHealth: () => isHealth,
    isMoonrock: () => isMoonrock,
    isChips: () => isChips,
    isCurse: () => isCurse,
  } as OrbPulled["orb"];
};

const samplePlData: GameChartDataPoint[] = [
  { value: 90, variant: "yellow", id: 0 },
  { value: 90, variant: "yellow", id: 1 },
  { value: 90, variant: "red", id: 2, pullId: 1 },
  { value: 95, variant: "green", id: 3, pullId: 2 },
  { value: 95, variant: "red", id: 4, pullId: 3 },
  { value: 105, variant: "green", id: 5, pullId: 4 },
  { value: 85, variant: "red", id: 6, pullId: 5 },
  { value: 85, variant: "yellow", id: 7 },
  { value: 90, variant: "green", id: 8, pullId: 6 },
  { value: 90, variant: "blue", id: 9 },
  { value: 105, variant: "green", id: 10 },
  { value: 120, variant: "green", id: 11 },
  { value: 70, variant: "red", id: 12 },
  { value: 75, variant: "green", id: 13 },
  { value: 75, variant: "red", id: 14 },
  { value: 90, variant: "green", id: 15 },
  { value: 110, variant: "green", id: 16 },
  { value: 110, variant: "red", id: 17 },
  { value: 140, variant: "green", id: 18 },
  { value: 70, variant: "yellow", id: 19 },
  { value: 70, variant: "red", id: 20 },
  { value: 75, variant: "green", id: 21 },
  { value: 90, variant: "green", id: 22 },
  { value: 90, variant: "red", id: 23 },
  { value: 90, variant: "blue", id: 24 },
  { value: 95, variant: "green", id: 25 },
  { value: 105, variant: "green", id: 26 },
];

const samplePulls = [
  { game_id: 1, id: 1, potential_moonrocks: 5, orb: createMockOrb("Point5") },
  { game_id: 1, id: 2, potential_moonrocks: 12, orb: createMockOrb("Point7") },
  { game_id: 1, id: 3, potential_moonrocks: 7, orb: createMockOrb("Bomb1") },
  { game_id: 1, id: 4, potential_moonrocks: 15, orb: createMockOrb("Point8") },
  {
    game_id: 1,
    id: 5,
    potential_moonrocks: 22,
    orb: createMockOrb("Multiplier50"),
  },
  { game_id: 1, id: 6, potential_moonrocks: 28, orb: createMockOrb("Point6") },
] as OrbPulled[];

const baseGame: GameSceneGame = {
  id: 1,
  level: 2,
  health: 4,
  points: 28,
  milestone: 40,
  multiplier: 1.5,
  moonrocks: 120,
  chips: 30,
  stake: 2,
  pullablesCount: 8,
  bag: [
    new Orb(OrbType.Point5),
    new Orb(OrbType.Point7),
    new Orb(OrbType.Bomb1),
    new Orb(OrbType.Health1),
    new Orb(OrbType.Multiplier50),
    new Orb(OrbType.Moonrock15),
  ],
};

const baseDistribution = {
  points: 4,
  bombs: 2,
  multipliers: 1,
  health: 1,
  special: 0,
};

const emptyDistribution = {
  points: 0,
  bombs: 0,
  multipliers: 0,
  health: 0,
  special: 0,
};

const baseBombDetails = {
  simple: { total: 3, count: 2 },
  double: { total: 1, count: 1 },
  triple: { total: 0, count: 0 },
};

const meta = {
  title: "Scenes/Game",
  component: GameScene,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    game: baseGame,
    plData: samplePlData,
    pulls: samplePulls,
    chartGoal: 40,
    distribution: baseDistribution,
    progressiveDistribution: emptyDistribution,
    bombDetails: baseBombDetails,
    outcomeKey: 0,
    outcomeShowMultiplied: false,
    isFatalBomb: false,
    isPulling: false,
    showRewardOverlay: false,
    showDistributionPercent: false,
    onPull: fn(),
    onOpenCashout: fn(),
    onEnterShop: fn(),
  },
} satisfies Meta<typeof GameScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LowHealth: Story = {
  args: {
    game: {
      ...baseGame,
      health: 1,
      level: 4,
      points: 55,
      milestone: 80,
    },
    distribution: {
      ...baseDistribution,
      bombs: 5,
      points: 2,
    },
    bombDetails: {
      simple: { total: 4, count: 3 },
      double: { total: 2, count: 2 },
      triple: { total: 0, count: 0 },
    },
  },
};

export const PullLoading: Story = {
  args: {
    isPulling: true,
  },
};

export const WithOutcome: Story = {
  args: {
    currentOrb: {
      variant: "point",
      content: "+5 pts",
      basePoints: 5,
    } satisfies OrbOutcome,
    outcomeKey: 1,
  },
};

export const WithMultipliedOutcome: Story = {
  args: {
    currentOrb: {
      variant: "point",
      content: "+5 pts",
      basePoints: 5,
      multipliedPoints: 7,
      activeMultiplier: 1.5,
    } satisfies OrbOutcome,
    outcomeKey: 2,
    outcomeShowMultiplied: true,
  },
};

export const FatalBomb: Story = {
  args: {
    currentOrb: {
      variant: "bomb",
      content: "-3 HP",
    } satisfies OrbOutcome,
    outcomeKey: 3,
    isFatalBomb: true,
  },
};

export const MilestoneReached: Story = {
  args: {
    game: {
      ...baseGame,
      points: 45,
      milestone: 40,
    },
    cashOutValue: 1.23,
    ante: 20,
    nextCurseLabel: "Double Bomb",
  },
};

export const EnteringShop: Story = {
  args: {
    game: {
      ...baseGame,
      points: 45,
      milestone: 40,
    },
    cashOutValue: 1.23,
    ante: 20,
    isEnteringShop: true,
  },
};
