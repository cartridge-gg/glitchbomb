import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertIcon, GearIcon, TrophyIcon } from "@/components/icons";
import { AchievementCard } from "./achievement-card";

const meta = {
  title: "Elements/Achievement Card",
  component: AchievementCard,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  args: {
    className: "w-[10.125rem]",
  },
} satisfies Meta<typeof AchievementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: {
    title: "Emergency Mode",
    variant: "complete",
    icon: <AlertIcon size="xl" className="text-green-100" />,
  },
};

export const InProgress: Story = {
  args: {
    title: "Double Up",
    count: 3,
    total: 5,
    variant: "inProgress",
    icon: <GearIcon size="xl" className="text-white-500" />,
  },
};

export const Locked: Story = {
  args: {
    variant: "locked",
    icon: <TrophyIcon variant="line" size="xl" className="text-white-500" />,
  },
};

export const Empty: Story = {
  args: {
    variant: "empty",
  },
};
