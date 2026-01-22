import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PLDataPoint } from "@/components/elements/pl-graph";
import type { OrbPulled } from "@/models";
import { GameOver } from "./game-over";

// Mock Orb class for storybook
const createMockOrb = (
  value: string,
): OrbPulled["orb"] =>
  ({
    value,
    name: () => value,
    isPoint: () =>
      value.startsWith("Point") ||
      value === "PointOrb1" ||
      value === "PointBomb4",
    isMultiplier: () => value.startsWith("Multiplier"),
    isBomb: () => value.startsWith("Bomb"),
    isHealth: () => value.startsWith("Health"),
    isMoonrock: () => value.startsWith("Moonrock"),
    isChips: () => value.startsWith("Chips"),
    isCurse: () => value.startsWith("Curse"),
  }) as OrbPulled["orb"];

// Sample P/L data matching the screenshot pattern
const samplePLData: PLDataPoint[] = [
  { value: 0, variant: "red", id: 0 },
  { value: -5, variant: "red", id: 1 },
  { value: -10, variant: "red", id: 2 },
  { value: 15, variant: "green", id: 3 },
  { value: 5, variant: "yellow", id: 4 },
  { value: -5, variant: "red", id: 5 },
  { value: 45, variant: "green", id: 6 },
  { value: 30, variant: "red", id: 7 },
  { value: 65, variant: "green", id: 8 },
  { value: 55, variant: "green", id: 9 },
  { value: 40, variant: "blue", id: 10 },
  { value: 80, variant: "green", id: 11 },
  { value: 150, variant: "green", id: 12 },
  { value: 120, variant: "red", id: 13 },
  { value: 100, variant: "green", id: 14 },
  { value: 85, variant: "red", id: 15 },
  { value: 70, variant: "red", id: 16 },
  { value: 100, variant: "green", id: 17 },
  { value: 80, variant: "red", id: 18 },
  { value: 60, variant: "blue", id: 19 },
  { value: 95, variant: "green", id: 20 },
  { value: 75, variant: "yellow", id: 21 },
  { value: 60, variant: "red", id: 22 },
];

// Sample pulls for history
const samplePulls: OrbPulled[] = [
  {
    pack_id: 1,
    game_id: 1,
    id: 1,
    orb: createMockOrb("Point5"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 2,
    orb: createMockOrb("Bomb1"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 3,
    orb: createMockOrb("Point7"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 4,
    orb: createMockOrb("Multiplier50"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 5,
    orb: createMockOrb("Point8"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 6,
    orb: createMockOrb("Bomb2"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 7,
    orb: createMockOrb("Moonrock15"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 8,
    orb: createMockOrb("Health1"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 9,
    orb: createMockOrb("Point9"),
  },
  {
    pack_id: 1,
    game_id: 1,
    id: 10,
    orb: createMockOrb("Bomb3"),
  },
] as OrbPulled[];

const meta = {
  title: "Containers/GameOver",
  component: GameOver,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-green-950">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    level: {
      control: { type: "number" },
      description: "Level reached",
    },
    moonrocksEarned: {
      control: { type: "number" },
      description: "Moon rocks earned",
    },
    cashedOut: {
      control: { type: "boolean" },
      description: "Whether player cashed out (true) or died (false)",
    },
    onPlayAgain: {
      action: "playAgain",
      description: "Called when Play Again button is clicked",
    },
  },
  args: {
    level: 5,
    moonrocksEarned: 0,
    plData: samplePLData,
    pulls: samplePulls,
    cashedOut: false,
  },
} satisfies Meta<typeof GameOver>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithMoonrocks: Story = {
  args: {
    level: 8,
    moonrocksEarned: 45,
    plData: samplePLData,
    pulls: samplePulls,
  },
};

export const HighLevel: Story = {
  args: {
    level: 15,
    moonrocksEarned: 120,
    plData: [
      ...samplePLData,
      { value: 130, variant: "green", id: 23 },
      { value: 180, variant: "green", id: 24 },
      { value: 220, variant: "blue", id: 25 },
    ],
    pulls: samplePulls,
  },
};

export const FirstLevel: Story = {
  args: {
    level: 1,
    moonrocksEarned: 0,
    plData: [
      { value: 0, variant: "green", id: 0 },
      { value: 5, variant: "green", id: 1 },
      { value: -5, variant: "red", id: 2 },
    ],
    pulls: [
      {
        pack_id: 1,
        game_id: 1,
        id: 1,
        orb: createMockOrb("Point5"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 2,
        orb: createMockOrb("Bomb1"),
      },
    ] as OrbPulled[],
  },
};

// Losing streak - mostly negative
const losingPLData: PLDataPoint[] = [
  { value: 0, variant: "green", id: 0 },
  { value: 5, variant: "green", id: 1 },
  { value: -10, variant: "red", id: 2 },
  { value: -20, variant: "red", id: 3 },
  { value: -15, variant: "green", id: 4 },
  { value: -30, variant: "red", id: 5 },
  { value: -25, variant: "red", id: 6 },
];

export const LosingStreak: Story = {
  args: {
    level: 3,
    moonrocksEarned: 0,
    plData: losingPLData,
    pulls: [
      {
        pack_id: 1,
        game_id: 1,
        id: 1,
        orb: createMockOrb("Point5"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 2,
        orb: createMockOrb("Bomb1"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 3,
        orb: createMockOrb("Bomb2"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 4,
        orb: createMockOrb("Health1"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 5,
        orb: createMockOrb("Bomb3"),
      },
    ] as OrbPulled[],
  },
};

// Big winner with lots of moonrocks
const bigWinnerPLData: PLDataPoint[] = [
  { value: 0, variant: "green", id: 0 },
  { value: 20, variant: "green", id: 1 },
  { value: 50, variant: "green", id: 2 },
  { value: 40, variant: "red", id: 3 },
  { value: 80, variant: "green", id: 4 },
  { value: 120, variant: "yellow", id: 5 },
  { value: 100, variant: "red", id: 6 },
  { value: 180, variant: "green", id: 7 },
  { value: 220, variant: "blue", id: 8 },
  { value: 200, variant: "red", id: 9 },
  { value: 280, variant: "green", id: 10 },
  { value: 350, variant: "green", id: 11 },
];

export const BigWinner: Story = {
  args: {
    level: 12,
    moonrocksEarned: 250,
    plData: bigWinnerPLData,
    pulls: [
      {
        pack_id: 1,
        game_id: 1,
        id: 1,
        orb: createMockOrb("Point9"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 2,
        orb: createMockOrb("Multiplier100"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 3,
        orb: createMockOrb("Point8"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 4,
        orb: createMockOrb("Bomb1"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 5,
        orb: createMockOrb("Moonrock40"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 6,
        orb: createMockOrb("Moonrock40"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 7,
        orb: createMockOrb("Health2"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 8,
        orb: createMockOrb("Multiplier150"),
      },
    ] as OrbPulled[],
  },
};

// Cashed out successfully - green theme
export const CashedOut: Story = {
  args: {
    level: 5,
    moonrocksEarned: 70,
    cashedOut: true,
    plData: samplePLData,
    pulls: samplePulls,
  },
};

// High level cash out
export const CashedOutHighLevel: Story = {
  args: {
    level: 10,
    moonrocksEarned: 180,
    cashedOut: true,
    plData: bigWinnerPLData,
    pulls: [
      {
        pack_id: 1,
        game_id: 1,
        id: 1,
        orb: createMockOrb("Point9"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 2,
        orb: createMockOrb("Multiplier150"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 3,
        orb: createMockOrb("Moonrock40"),
      },
      {
        pack_id: 1,
        game_id: 1,
        id: 4,
        orb: createMockOrb("Health2"),
      },
    ] as OrbPulled[],
  },
};
