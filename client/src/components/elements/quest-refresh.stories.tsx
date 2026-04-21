import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuestRefresh } from "./quest-refresh";

const meta = {
  title: "Elements/Quest Refresh",
  component: QuestRefresh,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof QuestRefresh>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    timeLeft: "12h 24m",
  },
};
