import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import { GameShop } from "./game-shop";

const meta = {
  title: "Containers/GameShop",
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
  argTypes: {
    balance: { control: "number" },
  },
  args: {
    balance: 30,
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Health1),
      new Orb(OrbType.Moonrock15),
      new Orb(OrbType.Chips15),
      new Orb(OrbType.Moonrock40),
    ],
    bag: [new Orb(OrbType.Point8), new Orb(OrbType.Health2)],
    onConfirm: fn(),
  },
} satisfies Meta<typeof GameShop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyBag: Story = {
  args: {
    bag: [],
  },
};

export const LowBalance: Story = {
  args: {
    balance: 5,
  },
};

export const HighBalance: Story = {
  args: {
    balance: 100,
  },
};

export const ManyOrbsInBag: Story = {
  args: {
    bag: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Point8),
      new Orb(OrbType.Health1),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Chips15),
    ],
  },
};
