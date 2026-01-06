import type { Meta, StoryObj } from "@storybook/react-vite";
import { Score } from "./score";

const meta = {
  title: "Elements/Score",
  component: Score,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    value: {
      control: { type: "number" },
      description: "The score value to display",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the score display",
    },
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size variant of the score display",
    },
  },
} satisfies Meta<typeof Score>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1234,
    variant: "default",
    size: "md",
  },
};

export const Zero: Story = {
  args: {
    value: 0,
    variant: "default",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    value: 42,
    variant: "default",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    value: 99999,
    variant: "default",
    size: "md",
  },
};

export const VeryLarge: Story = {
  args: {
    value: 9999999,
    variant: "default",
    size: "md",
  },
};
