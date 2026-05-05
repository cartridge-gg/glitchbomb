import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import { GameShop, type GameShopGame } from "./game-shop";

const baseGame: GameShopGame = {
  chips: 30,
  moonrocks: 120,
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
  args: {
    game: baseGame,
    onConfirm: fn(),
    className: "md:max-w-[420px]",
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
