import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { CashOut } from "./cash-out";

const meta = {
  title: "Elements/CashOut",
  component: CashOut,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: { type: "text" },
      description: "The button label text (default: 'Cash Out')",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant of the cash out button",
    },
    size: {
      control: { type: "select" },
      options: ["md"],
      description: "Size variant of the cash out button",
    },
    onClick: {
      action: "clicked",
      description: "Click handler",
    },
  },
} satisfies Meta<typeof CashOut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Cash Out",
    variant: "default",
    size: "md",
    onClick: fn(),
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Collect Rewards",
    variant: "default",
    size: "md",
    onClick: fn(),
  },
};

export const Withdraw: Story = {
  args: {
    label: "Withdraw",
    variant: "default",
    size: "md",
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    label: "Cash Out",
    variant: "default",
    size: "md",
    disabled: true,
    onClick: fn(),
  },
};
