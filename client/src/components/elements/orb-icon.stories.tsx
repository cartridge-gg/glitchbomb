import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { OrbIcon } from "./orb-icon";

const meta = {
  title: "Elements/Orb Icon",
  component: OrbIcon,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md"],
      description: "Size of the orb display",
    },
  },
  args: {
    orb: new Orb(OrbType.Point5),
    size: "md",
  },
} satisfies Meta<typeof OrbIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Point5: Story = {
  args: {
    orb: new Orb(OrbType.Point5), // Point5
  },
};

export const Point8: Story = {
  args: {
    orb: new Orb(OrbType.Point8), // Point8
  },
};

export const Health: Story = {
  args: {
    orb: new Orb(OrbType.Health1), // Health1
  },
};

export const Multiplier: Story = {
  args: {
    orb: new Orb(OrbType.Multiplier100), // Multiplier1
  },
};

export const Multiplier150: Story = {
  args: {
    orb: new Orb(OrbType.Multiplier150), // Multiplier150
  },
};

export const Special: Story = {
  args: {
    orb: new Orb(OrbType.Chips15), // Special1
  },
};
