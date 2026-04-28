import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { AchievementsProps } from "@/components/containers/achievements";
import { AchievementScene } from "./achievement";

const meta = {
  title: "Scenes/Achievement",
  component: AchievementScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full p-4 md:p-6">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof AchievementScene>;

export default meta;
type Story = StoryObj<typeof meta>;

type SampleAchievement = AchievementsProps["achievements"][number];

const sampleAchievements: SampleAchievement[] = [
  {
    id: "earned-1",
    icon: "fa-triangle-exclamation",
    title: "Emergency Mode",
    description: "Survive a run with 1 health.",
    count: 1,
    total: 1,
  },
  {
    id: "earned-2",
    icon: "fa-bolt",
    title: "Bomb Tech",
    description: "Defuse 10 bombs total.",
    count: 10,
    total: 10,
  },
  {
    id: "earned-3",
    icon: "fa-gear",
    title: "Tuned Up",
    description: "Reach a 3x multiplier.",
    count: 1,
    total: 1,
  },
  {
    id: "remaining-1",
    icon: "fa-triangle-exclamation",
    title: "Double Up",
    description: "Double your stake in a single run.",
    count: 3,
    total: 5,
  },
  {
    id: "remaining-2",
    icon: "fa-bolt",
    title: "Shockproof",
    description: "Survive 4 consecutive bombs.",
    count: 2,
    total: 4,
  },
  {
    id: "remaining-3",
    icon: "fa-gear",
    title: "Grease Monkey",
    description: "Purchase 6 orbs in the shop.",
    count: 1,
    total: 6,
  },
  {
    id: "remaining-4",
    icon: "fa-trophy",
    title: "Secret",
    description: "???",
    count: 0,
    total: 1,
    hidden: true,
  },
];

const allEarnedAchievements: SampleAchievement[] = [
  {
    id: "earned-1",
    icon: "fa-triangle-exclamation",
    title: "Emergency Mode",
    description: "Survive a run with 1 health.",
    count: 1,
    total: 1,
  },
  {
    id: "earned-2",
    icon: "fa-bolt",
    title: "Bomb Tech",
    description: "Defuse 10 bombs total.",
    count: 10,
    total: 10,
  },
  {
    id: "earned-3",
    icon: "fa-gear",
    title: "Tuned Up",
    description: "Reach a 3x multiplier.",
    count: 1,
    total: 1,
  },
  {
    id: "earned-4",
    icon: "fa-triangle-exclamation",
    title: "Double Up",
    description: "Double your stake in a single run.",
    count: 5,
    total: 5,
  },
  {
    id: "earned-5",
    icon: "fa-bolt",
    title: "Shockproof",
    description: "Survive 4 consecutive bombs.",
    count: 4,
    total: 4,
  },
  {
    id: "earned-6",
    icon: "fa-gear",
    title: "Grease Monkey",
    description: "Purchase 6 orbs in the shop.",
    count: 6,
    total: 6,
  },
  {
    id: "earned-7",
    icon: "fa-trophy",
    title: "Secret Finder",
    description: "Discover a hidden mechanic.",
    count: 1,
    total: 1,
  },
];

export const Default: Story = {
  args: {
    achievements: sampleAchievements,
    onClose: fn(),
    className: "w-full",
  },
};

export const AllEarned: Story = {
  args: {
    achievements: allEarnedAchievements,
    onClose: fn(),
    className: "w-full",
  },
};

export const Empty: Story = {
  args: {
    achievements: [],
    onClose: fn(),
    className: "w-full",
  },
};
