import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Action } from "./action";

const meta = {
  title: "Elements/Action",
  component: Action,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
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
  args: {
    variant: "default",
    size: "md",
    onClick: fn(),
    className: "size-20",
    children: (
      <p>
        Cash
        <br />
        Out
      </p>
    ),
  },
} satisfies Meta<typeof Action>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
