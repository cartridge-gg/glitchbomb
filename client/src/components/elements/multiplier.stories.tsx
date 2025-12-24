import type { Meta, StoryObj } from "@storybook/react-vite";
import { Multiplier } from "./multiplier";

const meta = {
  title: "Elements/Multiplier",
  component: Multiplier,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    magnitude: {
      control: "select",
      options: [1, 2, 3, 4, 5],
    },
    count: {
      control: { type: "number", min: 1, max: 10 },
    },
    size: {
      control: "select",
      options: ["md"],
    },
  },
} satisfies Meta<typeof Multiplier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    size: "md",
    magnitude: 1,
  },
};
