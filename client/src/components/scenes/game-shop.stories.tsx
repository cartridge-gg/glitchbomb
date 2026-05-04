import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import type { GameSceneGame } from "./game";
import { GameShop } from "./game-shop";

const baseGame: GameSceneGame = {
  id: 1,
  over: 0,
  level: 2,
  health: 4,
  points: 28,
  milestone: 40,
  multiplier: 1.5,
  moonrocks: 120,
  chips: 30,
  stake: 2,
  expiration: Math.floor(Date.now() / 1000) + 86400,
  pullablesCount: 8,
  shop: [
    new Orb(OrbType.Point5),
    new Orb(OrbType.Multiplier50),
    new Orb(OrbType.Health1),
    new Orb(OrbType.Moonrock15),
    new Orb(OrbType.Chips15),
    new Orb(OrbType.Moonrock40),
  ],
  bag: [new Orb(OrbType.Point8), new Orb(OrbType.Health2)],
};

const meta = {
  title: "Scenes/Game Shop",
  component: GameShop,
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
  args: {
    game: baseGame,
    onConfirm: fn(),
  },
} satisfies Meta<typeof GameShop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyBag: Story = {
  args: {
    game: { ...baseGame, bag: [] },
  },
};

export const LowBalance: Story = {
  args: {
    game: { ...baseGame, chips: 5 },
  },
};

export const HighBalance: Story = {
  args: {
    game: { ...baseGame, chips: 100 },
  },
};

export const ManyOrbsInBag: Story = {
  args: {
    game: {
      ...baseGame,
      bag: [
        new Orb(OrbType.Point5),
        new Orb(OrbType.Point8),
        new Orb(OrbType.Health1),
        new Orb(OrbType.Multiplier50),
        new Orb(OrbType.Chips15),
      ],
    },
  },
};
