import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { BagItems } from "./bag-items";

const mockItems = [
  { orb: new Orb(OrbType.Point5) },
  { orb: new Orb(OrbType.Point8) },
  { orb: new Orb(OrbType.Health1) },
  { orb: new Orb(OrbType.Multiplier50) },
  { orb: new Orb(OrbType.Moonrock15) },
];

const meta = {
  title: "Containers/Bag Items",
  component: BagItems,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: {
      control: { type: "text" },
    },
  },
  args: {
    title: `Your orbs (${mockItems.length})`,
    items: mockItems,
  },
} satisfies Meta<typeof BagItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Empty: Story = {
  args: {
    title: "Your orbs (0)",
    items: [],
  },
};

export const WithDiscards: Story = {
  args: {
    items: [
      { orb: new Orb(OrbType.Point5) },
      { orb: new Orb(OrbType.Point8), discarded: true },
      { orb: new Orb(OrbType.Health1) },
      { orb: new Orb(OrbType.Multiplier50), discarded: true },
      { orb: new Orb(OrbType.Moonrock15) },
    ],
  },
};

export const ManyOrbs: Story = {
  args: {
    title: "Your orbs (9)",
    items: [
      { orb: new Orb(OrbType.Point5) },
      { orb: new Orb(OrbType.Point6) },
      { orb: new Orb(OrbType.Point7) },
      { orb: new Orb(OrbType.Health1) },
      { orb: new Orb(OrbType.Health3) },
      { orb: new Orb(OrbType.Multiplier50) },
      { orb: new Orb(OrbType.Multiplier100) },
      { orb: new Orb(OrbType.Moonrock15) },
      { orb: new Orb(OrbType.Chips15) },
    ],
  },
};

export const Purchasing: Story = {
  args: {
    title: "Purchasing (3)",
    items: [
      { orb: new Orb(OrbType.Point5) },
      { orb: new Orb(OrbType.Multiplier50) },
      { orb: new Orb(OrbType.Health1) },
    ],
  },
};
