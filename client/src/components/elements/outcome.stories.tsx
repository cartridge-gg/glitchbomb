import type { Meta, StoryObj } from "@storybook/react-vite";
import { Outcome } from "./outcome";

const meta: Meta<typeof Outcome> = {
  title: "Elements/Outcome",
  component: Outcome,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bomb", "point", "multiplier", "chip", "moonrock"],
    },
    size: {
      control: "select",
      options: ["md"],
    },
    content: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Outcome>;

export const Points: Story = {
  args: {
    variant: "point",
    size: "md",
    content: "+50 pts",
  },
};

export const Multiplier: Story = {
  args: {
    variant: "multiplier",
    size: "md",
    content: "x3",
  },
};

export const Bomb: Story = {
  args: {
    variant: "bomb",
    size: "md",
    content: "-1 HP",
  },
};

export const Health: Story = {
  args: {
    variant: "health",
    size: "md",
    content: "+1 HP",
  },
};

export const Moonrocks: Story = {
  args: {
    variant: "moonrock",
    size: "md",
    content: "+50 Moonrocks",
  },
};

export const Chips: Story = {
  args: {
    variant: "chip",
    size: "md",
    content: "+25 Chips",
  },
};
