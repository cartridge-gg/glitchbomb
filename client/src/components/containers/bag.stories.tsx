import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { Bag } from "./bag";

const bagItems = [
  { orb: new Orb(OrbType.Point5) },
  { orb: new Orb(OrbType.Point8) },
  { orb: new Orb(OrbType.Health1) },
  { orb: new Orb(OrbType.Multiplier50) },
  { orb: new Orb(OrbType.Moonrock15) },
];

const pendingItems = [
  { orb: new Orb(OrbType.Point7) },
  { orb: new Orb(OrbType.Multiplier100) },
];

const meta = {
  title: "Containers/Bag",
  component: Bag,
  parameters: {
    layout: "padded",
  },
  args: {
    pendingItems: {
      title: `Purchasing (${pendingItems.length})`,
      items: pendingItems,
    },
    bagItems: {
      title: `Your orbs (${bagItems.length})`,
      items: bagItems,
    },
  },
} satisfies Meta<typeof Bag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const NoPending: Story = {
  args: {
    pendingItems: {
      title: "Purchasing (0)",
      items: [],
    },
  },
};

export const EmptyBag: Story = {
  args: {
    pendingItems: {
      title: "Purchasing (0)",
      items: [],
    },
    bagItems: {
      title: "Your orbs (0)",
      items: [],
    },
  },
};

export const WithDiscards: Story = {
  args: {
    bagItems: {
      title: `Your orbs (${bagItems.length})`,
      items: [
        { orb: new Orb(OrbType.Point5) },
        { orb: new Orb(OrbType.Point8), discarded: true },
        { orb: new Orb(OrbType.Health1) },
        { orb: new Orb(OrbType.Multiplier50), discarded: true },
        { orb: new Orb(OrbType.Moonrock15) },
      ],
    },
  },
};
