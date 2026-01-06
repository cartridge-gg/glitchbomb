import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import { GameShop } from "./game-shop";

const meta = {
  title: "Containers/GameShop",
  component: GameShop,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    balance: { control: "number" },
    onSubmit: { action: "submitted" },
    onContinue: { action: "continued" },
  },
} satisfies Meta<typeof GameShop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    balance: 100,
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Health1),
      new Orb(OrbType.Moonrock15),
      new Orb(OrbType.Chips15),
      new Orb(OrbType.Moonrock40),
    ],
    onSubmit: fn(),
    onInventory: fn(),
    onContinue: fn(),
  },
};

export const Reduced: Story = {
  args: {
    balance: 100,
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Health1),
      new Orb(OrbType.Moonrock15),
      new Orb(OrbType.Chips15),
      new Orb(OrbType.Moonrock40),
    ],
    onSubmit: fn(),
    onInventory: fn(),
    onContinue: fn(),
  },
  render: (args) => {
    return <GameShop {...args} className="max-h-96" />;
  },
};
