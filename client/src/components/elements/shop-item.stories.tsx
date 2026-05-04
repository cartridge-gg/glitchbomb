import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import { ShopItem } from "./shop-item";

const meta = {
  title: "Elements/Shop Item",
  component: ShopItem,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="bg-green-950 p-4 max-w-[420px]">
        <Story />
      </div>
    ),
  ],
  args: {
    orb: new Orb(OrbType.Point5),
    price: 10,
    disabled: false,
    onAdd: fn(),
  },
} satisfies Meta<typeof ShopItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Multiplier: Story = {
  args: {
    orb: new Orb(OrbType.Multiplier50),
    price: 25,
  },
};

export const Health: Story = {
  args: {
    orb: new Orb(OrbType.Health1),
    price: 15,
  },
};

export const Chips: Story = {
  args: {
    orb: new Orb(OrbType.Chips15),
    price: 20,
  },
};

export const Moonrock: Story = {
  args: {
    orb: new Orb(OrbType.Moonrock40),
    price: 30,
  },
};
