import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models/orb";
import { RecentPulls } from "./recent-pulls";

const meta = {
  title: "Elements/Recent Pulls",
  component: RecentPulls,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    orbs: {
      control: "object",
      description: "Array of recent orb pulls",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Component variant",
    },
  },
} satisfies Meta<typeof RecentPulls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Bomb1),
      new Orb(OrbType.Multiplier50),
    ],
  },
};

export const Empty: Story = {
  args: {
    orbs: [],
  },
};

export const OneOrb: Story = {
  args: {
    orbs: [new Orb(OrbType.Moonrock15)],
  },
};

export const TwoOrbs: Story = {
  args: {
    orbs: [new Orb(OrbType.Health1), new Orb(OrbType.Point7)],
  },
};

export const MaxOrbs: Story = {
  args: {
    orbs: [
      new Orb(OrbType.Bomb2),
      new Orb(OrbType.Point9),
      new Orb(OrbType.Chips15),
    ],
  },
};

export const MoreThanThree: Story = {
  args: {
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Bomb1),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Health3),
      new Orb(OrbType.Moonrock40),
    ],
  },
};
