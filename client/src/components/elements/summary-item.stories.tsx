import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { SummaryItem } from "./summary-item";

const meta = {
  title: "Elements/Summary Item",
  component: SummaryItem,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size of the summary item",
    },
    quantity: {
      control: { type: "number" },
      description: "Quantity badge value",
    },
  },
  args: {
    orb: new Orb(OrbType.Point5),
    quantity: 2,
    size: "md",
  },
} satisfies Meta<typeof SummaryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Point: Story = {
  args: {
    orb: new Orb(OrbType.Point5),
  },
};

export const Health: Story = {
  args: {
    orb: new Orb(OrbType.Health1),
  },
};

export const Multiplier: Story = {
  args: {
    orb: new Orb(OrbType.Multiplier100),
  },
};

export const Bomb: Story = {
  args: {
    orb: new Orb(OrbType.Bomb1),
  },
};

export const Chips: Story = {
  args: {
    orb: new Orb(OrbType.Chips15),
  },
};

export const Moonrock: Story = {
  args: {
    orb: new Orb(OrbType.Moonrock15),
  },
};
