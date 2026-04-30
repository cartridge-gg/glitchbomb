import type { Meta, StoryObj } from "@storybook/react-vite";
import { BombSlots } from "./bomb-slots";

const meta = {
  title: "Containers/Bomb Slots",
  component: BombSlots,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    details: {
      control: { type: "object" },
      description: "Bomb counts grouped by simple, double and triple",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof BombSlots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    details: {
      simple: { total: 2, count: 2 },
      double: { total: 2, count: 1 },
      triple: { total: 1, count: 1 },
    },
    variant: "default",
  },
};
