import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestCount } from "./quest-count";

const meta = {
  title: "Elements/Quest Count",
  component: QuestCount,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof QuestCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 2,
    total: 6,
  },
};

export const Complete: Story = {
  args: {
    count: 6,
    total: 6,
  },
};
