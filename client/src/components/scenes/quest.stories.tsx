import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QuestScene } from "./quest";

const meta = {
  title: "Scenes/Quest",
  component: QuestScene,
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
} satisfies Meta<typeof QuestScene>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuests = [
  {
    id: "quest-1",
    title: "Bag Builder",
    description: "Pull 3 multiplier orbs in a single run.",
    count: 1,
    total: 3,
  },
  {
    id: "quest-2",
    title: "Bomb Squad",
    description: "Defuse 5 bombs before cashing out.",
    count: 5,
    total: 5,
  },
  {
    id: "quest-3",
    title: "Orb Collector",
    description: "Pull 10 point orbs across any runs.",
    count: 6,
    total: 10,
  },
];

export const Default: Story = {
  args: {
    quests: sampleQuests,
    timeLeft: "12h 24m",
    onClose: fn(),
    className: "w-full",
  },
};

export const AllCompleted: Story = {
  args: {
    quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
    timeLeft: "12h 24m",
    onClose: fn(),
    className: "w-full",
  },
};

export const Empty: Story = {
  args: {
    quests: [],
    timeLeft: "12h 24m",
    onClose: fn(),
    className: "w-full",
  },
};
