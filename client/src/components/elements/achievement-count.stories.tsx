import type { Meta, StoryObj } from "@storybook/react-vite";
import { AchievementCount } from "./achievement-count";

const meta = {
  title: "Elements/Achievement Count",
  component: AchievementCount,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof AchievementCount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    total: 29,
  },
};

export const AllEarned: Story = {
  args: {
    count: 29,
    total: 29,
  },
};
