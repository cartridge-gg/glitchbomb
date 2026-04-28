import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TokenIcon } from "../icons";
import { Balance } from "./balance";

const meta = {
  title: "Elements/Balance",
  component: Balance,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    balance: {
      control: "number",
      description: "The balance value to display",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  args: {
    balance: 2102,
    onClick: fn(),
  },
} satisfies Meta<typeof Balance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    balance: 2102,
  },
};

export const Faucet: Story = {
  args: {
    icon: <TokenIcon size="sm" />,
    variant: "faucet",
    balance: 2102,
  },
};

export const Loading: Story = {
  args: {
    balance: 2102,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    balance: 0,
  },
};

export const Small: Story = {
  args: {
    balance: 123,
  },
};

export const Thousands: Story = {
  args: {
    balance: 1234,
  },
};

export const TenThousands: Story = {
  args: {
    balance: 12345,
  },
};

export const HundredThousands: Story = {
  args: {
    balance: 123456,
  },
};

export const Millions: Story = {
  args: {
    balance: 1234567,
  },
};

export const Billions: Story = {
  args: {
    balance: 1234567890,
  },
};

export const Negative: Story = {
  args: {
    balance: -100,
  },
};
