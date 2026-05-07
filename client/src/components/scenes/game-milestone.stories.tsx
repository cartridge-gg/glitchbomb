import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { GameChartDataPoint } from "@/components/elements";
import type { OrbPulled } from "@/models";
import {
  GameMilestoneScene,
  type GameMilestoneSceneGame,
} from "./game-milestone";

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

const baseGame: GameMilestoneSceneGame = {
  level: 2,
  health: 4,
  points: 45,
  milestone: 40,
  moonrocks: 120,
  chips: 30,
};

const meta = {
  title: "Scenes/GameMilestone",
  component: GameMilestoneScene,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    game: baseGame,
    plData: samplePlData,
    pulls: samplePulls,
    chartGoal: 40,
    cashOutValue: 1.23,
    ante: 20,
    onOpenCashout: fn(),
    onEnterShop: fn(),
    className: "md:max-w-[420px]",
  },
} satisfies Meta<typeof GameMilestoneScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDoubleBombCurse: Story = {
  args: {
    nextCurseLabel: "Double Bomb",
  },
};

export const WithBomberangCurse: Story = {
  args: {
    nextCurseLabel: "Bomberang",
  },
};

export const EnteringShop: Story = {
  args: {
    isEnteringShop: true,
  },
};

export const CashingOut: Story = {
  args: {
    isCashingOut: true,
  },
};
