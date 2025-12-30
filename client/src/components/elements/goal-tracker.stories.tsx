import type { Meta, StoryObj } from "@storybook/react-vite";
import { GoalTracker } from "./goal-tracker";

const meta = {
  title: "Elements/GoalTracker",
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
    label: {
      control: { type: "text" },
      description: "The label text (default: 'Goal :')",
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
} satisfies Meta<typeof GoalTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 18,
    label: "Goal :",
    variant: "default",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    value: 1,
    label: "Goal :",
    variant: "default",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    value: 1000,
    label: "Goal :",
    variant: "default",
    size: "md",
  },
};
