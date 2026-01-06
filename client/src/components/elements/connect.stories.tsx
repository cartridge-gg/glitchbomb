import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Connect } from "./connect";

const meta = {
  title: "Elements/Connect",
  component: Connect,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Connect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    onClick: fn(),
  },
};
