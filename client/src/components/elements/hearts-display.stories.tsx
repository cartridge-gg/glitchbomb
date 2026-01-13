import type { Meta, StoryObj } from "@storybook/react-vite";
import { HeartsDisplay } from "./hearts-display";

const meta = {
  title: "Elements/HeartsDisplay",
  component: HeartsDisplay,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    health: {
      control: { type: "range", min: 0, max: 5, step: 1 },
      description: "Current health",
    },
    maxHealth: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Maximum health",
    },
  },
  args: {
    health: 3,
    maxHealth: 5,
  },
} satisfies Meta<typeof HeartsDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FullHealth: Story = {
  args: {
    health: 5,
  },
};

export const LowHealth: Story = {
  args: {
    health: 1,
  },
};

export const NoHealth: Story = {
  args: {
    health: 0,
  },
};

export const ExtendedHealth: Story = {
  args: {
    health: 7,
    maxHealth: 10,
  },
};
