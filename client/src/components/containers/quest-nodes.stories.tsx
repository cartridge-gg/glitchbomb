import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QuestNodes } from "./quest-nodes";

const meta = {
  title: "Containers/Quest Nodes",
  component: QuestNodes,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "var(--black-100)",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuestNodes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nodes: [
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "default" },
      { variant: "default" },
    ],
  },
};

export const Empty: Story = {
  args: {
    nodes: [
      { variant: "default" },
      { variant: "default" },
      { variant: "default" },
      { variant: "default" },
      { variant: "default" },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    nodes: [
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "default", completed: true },
    ],
  },
};

export const WithGift: Story = {
  args: {
    nodes: [
      { variant: "default", completed: true },
      { variant: "default", completed: true },
      { variant: "gift", completed: true, onClick: fn() },
      { variant: "default" },
      { variant: "default" },
    ],
  },
};

export const Mixed: Story = {
  args: {
    nodes: [
      { variant: "default", completed: true },
      { variant: "gift", completed: true },
      { variant: "default", completed: true },
      { variant: "gift" },
      { variant: "default" },
      { variant: "default" },
      { variant: "default" },
    ],
  },
};
