import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { GameChartDataPoint } from "@/components/elements";
import type { OrbPulled } from "@/models";
import { GameOver } from "./game-over";

// Mock Orb class for storybook (matches the shape consumed by GameChart tooltips).
const createMockOrb = (value: string): OrbPulled["orb"] => {
  const isPoint = value.startsWith("Point");
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
  { value: 90, variant: "red", id: 1, pullId: 1 },
  { value: 95, variant: "green", id: 2, pullId: 2 },
  { value: 95, variant: "red", id: 3, pullId: 3 },
  { value: 105, variant: "green", id: 4, pullId: 4 },
  { value: 85, variant: "red", id: 5, pullId: 5 },
  { value: 90, variant: "green", id: 6, pullId: 6 },
  { value: 110, variant: "green", id: 7, pullId: 7 },
  { value: 120, variant: "green", id: 8, pullId: 8 },
  { value: 100, variant: "red", id: 9, pullId: 9 },
  { value: 140, variant: "green", id: 10, pullId: 10 },
];

const samplePulls: OrbPulled[] = [
  { game_id: 1, id: 1, potential_moonrocks: 90, orb: createMockOrb("Bomb1") },
  { game_id: 1, id: 2, potential_moonrocks: 95, orb: createMockOrb("Point5") },
  { game_id: 1, id: 3, potential_moonrocks: 95, orb: createMockOrb("Bomb2") },
  { game_id: 1, id: 4, potential_moonrocks: 105, orb: createMockOrb("Point7") },
  { game_id: 1, id: 5, potential_moonrocks: 85, orb: createMockOrb("Bomb3") },
  {
    game_id: 1,
    id: 6,
    potential_moonrocks: 90,
    orb: createMockOrb("Multiplier50"),
  },
  { game_id: 1, id: 7, potential_moonrocks: 110, orb: createMockOrb("Point8") },
  {
    game_id: 1,
    id: 8,
    potential_moonrocks: 120,
    orb: createMockOrb("Moonrock15"),
  },
  { game_id: 1, id: 9, potential_moonrocks: 100, orb: createMockOrb("Bomb1") },
  {
    game_id: 1,
    id: 10,
    potential_moonrocks: 140,
    orb: createMockOrb("Point9"),
  },
] as OrbPulled[];

const losingPlData: GameChartDataPoint[] = [
  { value: 100, variant: "yellow", id: 0 },
  { value: 95, variant: "red", id: 1, pullId: 1 },
  { value: 80, variant: "red", id: 2, pullId: 2 },
  { value: 85, variant: "green", id: 3, pullId: 3 },
  { value: 60, variant: "red", id: 4, pullId: 4 },
  { value: 50, variant: "red", id: 5, pullId: 5 },
];

const losingPulls: OrbPulled[] = [
  { game_id: 1, id: 1, potential_moonrocks: 95, orb: createMockOrb("Bomb1") },
  { game_id: 1, id: 2, potential_moonrocks: 80, orb: createMockOrb("Bomb2") },
  { game_id: 1, id: 3, potential_moonrocks: 85, orb: createMockOrb("Point5") },
  { game_id: 1, id: 4, potential_moonrocks: 60, orb: createMockOrb("Bomb3") },
  { game_id: 1, id: 5, potential_moonrocks: 50, orb: createMockOrb("Bomb1") },
] as OrbPulled[];

const meta = {
  title: "Scenes/Game Over",
  component: GameOver,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    moonrocksEarned: 80,
    plData: samplePlData,
    pulls: samplePulls,
    cashedOut: true,
    stake: 3,
    tokenPrice: 0.05,
    supply: 100_000_000n,
    target: 200_000_000n,
    onPlayAgain: fn(),
    onOpenStash: fn(),
    className: "md:max-w-[420px]",
  },
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GlitchedOut: Story = {
  args: {
    moonrocksEarned: 0,
    cashedOut: false,
    plData: losingPlData,
    pulls: losingPulls,
  },
};

export const Expired: Story = {
  args: {
    moonrocksEarned: 0,
    cashedOut: false,
    expired: true,
    plData: losingPlData,
    pulls: losingPulls,
  },
};

export const BigWinner: Story = {
  args: {
    moonrocksEarned: 250,
    stake: 5,
  },
};

export const NoPayoutContext: Story = {
  args: {
    moonrocksEarned: 80,
    stake: undefined,
    tokenPrice: null,
    supply: undefined,
    target: undefined,
  },
};
