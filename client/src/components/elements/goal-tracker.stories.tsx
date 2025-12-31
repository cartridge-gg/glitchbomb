import type { Meta, StoryObj } from "@storybook/react-vite";
import { GoalTracker } from "./goal-tracker";

const meta = {
  title: "Elements/Goal Tracker",
  component: GoalTracker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number" },
      description: "The goal value to display",
    },
    total: {
      control: { type: "number" },
      description: "The total value to display",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the goal tracker",
    },
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size variant of the goal tracker",
    },
  },
  args: {
    value: 9,
    total: 18,
    variant: "default",
    size: "md",
  },
} satisfies Meta<typeof GoalTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 18,
  },
};
