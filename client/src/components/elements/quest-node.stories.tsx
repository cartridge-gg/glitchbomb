import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QuestNode } from "./quest-node";

const meta = {
  title: "Elements/Quest Node",
  component: QuestNode,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "gift"],
    },
    completed: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof QuestNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};

export const DefaultCompleted: Story = {
  args: {
    variant: "default",
    completed: true,
  },
};

export const Gift: Story = {
  args: {
    variant: "gift",
  },
};

export const GiftCompletedClickable: Story = {
  args: {
    variant: "gift",
    completed: true,
    onClick: fn(),
  },
};

export const GiftCompletedUsed: Story = {
  args: {
    variant: "gift",
    completed: true,
  },
};
