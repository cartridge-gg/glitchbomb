import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertIcon, BoltIcon, GearIcon, TrophyIcon } from "@/components/icons";
import { Achievements } from "./achievements";

const meta = {
  title: "Containers/Achievements",
  component: Achievements,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof Achievements>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAchievements = [
  {
    id: "earned-1",
    title: "Emergency Mode",
    variant: "complete" as const,
    icon: <AlertIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-2",
    title: "Bomb Tech",
    variant: "complete" as const,
    icon: <BoltIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-3",
    title: "Tuned Up",
    variant: "complete" as const,
    icon: <GearIcon size="xl" className="text-green-100" />,
  },
  {
    id: "remaining-1",
    title: "Double Up",
    variant: "inProgress" as const,
    count: 3,
    total: 5,
    icon: <AlertIcon size="xl" className="text-white-500" />,
  },
  {
    id: "remaining-2",
    title: "Shockproof",
    variant: "inProgress" as const,
    count: 2,
    total: 4,
    icon: <BoltIcon size="xl" className="text-white-500" />,
  },
  {
    id: "remaining-3",
    title: "Grease Monkey",
    variant: "inProgress" as const,
    count: 1,
    total: 6,
    icon: <GearIcon size="xl" className="text-white-500" />,
  },
  {
    id: "remaining-4",
    variant: "locked" as const,
    icon: <TrophyIcon variant="line" size="xl" className="text-white-500" />,
  },
];

const allEarnedAchievements = [
  {
    id: "earned-1",
    title: "Emergency Mode",
    variant: "complete" as const,
    icon: <AlertIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-2",
    title: "Bomb Tech",
    variant: "complete" as const,
    icon: <BoltIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-3",
    title: "Tuned Up",
    variant: "complete" as const,
    icon: <GearIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-4",
    title: "Double Up",
    variant: "complete" as const,
    icon: <AlertIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-5",
    title: "Shockproof",
    variant: "complete" as const,
    icon: <BoltIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-6",
    title: "Grease Monkey",
    variant: "complete" as const,
    icon: <GearIcon size="xl" className="text-green-100" />,
  },
  {
    id: "earned-7",
    title: "Secret Finder",
    variant: "complete" as const,
    icon: <TrophyIcon variant="solid" size="xl" className="text-green-100" />,
  },
];

export const Default: Story = {
  args: {
    achievements: sampleAchievements,
  },
};

export const AllEarned: Story = {
  args: {
    achievements: allEarnedAchievements,
  },
};

export const Empty: Story = {
  args: {
    achievements: [],
  },
};
