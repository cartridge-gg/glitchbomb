import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestCard } from "./quest-card";

const meta = {
  title: "Elements/Quest Card",
  component: QuestCard,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  args: {
    className: "w-[22rem]",
  },
} satisfies Meta<typeof QuestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Bag Builder",
    description: "Pull 3 multiplier orbs in a single run.",
    count: 1,
    total: 3,
    variant: "default",
  },
};

export const Complete: Story = {
  args: {
    title: "Bomb Squad",
    description: "Defuse 5 bombs before cashing out.",
    count: 5,
    total: 5,
    variant: "complete",
  },
};
