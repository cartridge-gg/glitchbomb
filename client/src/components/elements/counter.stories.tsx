import type { Meta, StoryObj } from "@storybook/react-vite";
import { Counter } from "./counter";

const meta = {
  title: "Elements/Counter",
  component: Counter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    balance: {
      control: { type: "number" },
      description: "The counter balance to display",
    },
    variant: {
      control: { type: "select" },
      options: ["moonrock", "chip"],
      description: "Visual variant of the counter display",
    },
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size variant of the counter display",
    },
  },
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Moonrocks: Story = {
  args: {
    balance: 80,
    variant: "moonrock",
    size: "md",
  },
};

export const Chips: Story = {
  args: {
    balance: 36,
    variant: "chip",
    size: "md",
  },
};

export const Zero: Story = {
  args: {
    balance: 0,
    variant: "moonrock",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    balance: 999,
    variant: "moonrock",
    size: "md",
  },
};

export const VeryLarge: Story = {
  args: {
    balance: 1000000,
    variant: "moonrock",
    size: "md",
  },
};
