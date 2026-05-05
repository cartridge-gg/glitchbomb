import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models/orb";
import { ShopItems } from "./shop-items";

const meta = {
  title: "Containers/Shop Items",
  component: ShopItems,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ShopItems>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    orb: new Orb(OrbType.Point5),
    price: 10,
    disabled: false,
    onAdd: fn(),
  },
  {
    orb: new Orb(OrbType.Multiplier50),
    price: 25,
    disabled: false,
    onAdd: fn(),
  },
  {
    orb: new Orb(OrbType.Health1),
    price: 15,
    disabled: false,
    onAdd: fn(),
  },
  {
    orb: new Orb(OrbType.Chips15),
    price: 20,
    disabled: false,
    onAdd: fn(),
  },
  {
    orb: new Orb(OrbType.Moonrock40),
    price: 30,
    disabled: false,
    onAdd: fn(),
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
  },
};

export const SomeDisabled: Story = {
  args: {
    items: sampleItems.map((item, i) => ({
      ...item,
      disabled: i % 2 === 1,
    })),
  },
};
