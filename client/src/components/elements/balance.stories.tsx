import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Balance } from "./balance";

const meta = {
  title: "Elements/Balance",
  component: Balance,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    balance: {
      control: "number",
    },
  },
  args: {
    balance: 1000,
  },
} satisfies Meta<typeof Balance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    onClick: fn(),
  },
};
