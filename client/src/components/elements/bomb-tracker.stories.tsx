import type { Meta, StoryObj } from "@storybook/react-vite";
import { BombTracker } from "./bomb-tracker";

const meta = {
  title: "Elements/Bomb Tracker",
  component: BombTracker,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    details: {
      control: { type: "object" },
      description: "Bomb details with simple, double, and triple variants",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the bomb tracker",
    },
    size: {
      control: { type: "select" },
      options: ["md", "lg"],
      description: "Size variant of the bomb tracker",
    },
  },
} satisfies Meta<typeof BombTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    details: {
      simple: { total: 3, count: 1 },
      double: { total: 1, count: 1 },
      triple: { total: 1, count: 1 },
    },
    variant: "default",
    size: "lg",
  },
};

export const OnlySimple: Story = {
  args: {
    details: {
      simple: { total: 5, count: 5 },
      double: { total: 0, count: 0 },
      triple: { total: 0, count: 0 },
    },
    variant: "default",
    size: "lg",
  },
};

export const Mixed: Story = {
  args: {
    details: {
      simple: { total: 2, count: 2 },
      double: { total: 2, count: 2 },
      triple: { total: 1, count: 1 },
    },
    variant: "default",
    size: "lg",
  },
};

export const PartiallyUsed: Story = {
  args: {
    details: {
      simple: { total: 3, count: 1 },
      double: { total: 2, count: 0 },
      triple: { total: 1, count: 0 },
    },
    variant: "default",
    size: "lg",
  },
};

export const AllUsed: Story = {
  args: {
    details: {
      simple: { total: 3, count: 0 },
      double: { total: 1, count: 0 },
      triple: { total: 1, count: 0 },
    },
    variant: "default",
    size: "lg",
  },
};
