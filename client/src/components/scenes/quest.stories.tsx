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
    icon: "fa-layer-group",
    title: "Bag Builder",
    description: "Pull 3 multiplier orbs in a single run.",
    count: 1,
    total: 3,
  },
  {
    id: "quest-2",
    icon: "fa-bomb",
    title: "Bomb Squad",
    description: "Defuse 5 bombs before cashing out.",
    count: 5,
    total: 5,
  },
  {
    id: "quest-3",
    icon: "fa-circle-dot",
    title: "Orb Collector",
    description: "Pull 10 point orbs across any runs.",
    count: 6,
    total: 10,
  },
];

const EXPIRATION = Math.floor(Date.now() / 1000) + 12 * 3600 + 24 * 60;

export const Default: Story = {
  args: {
    questsProps: {
      quests: sampleQuests,
      expiration: EXPIRATION,
    },
    onClose: fn(),
    className: "w-full",
  },
};

export const AllCompleted: Story = {
  args: {
    questsProps: {
      quests: sampleQuests.map((quest) => ({ ...quest, count: quest.total })),
      expiration: EXPIRATION,
    },
    onClose: fn(),
    className: "w-full",
  },
};

export const Empty: Story = {
  args: {
    questsProps: {
      quests: [],
      expiration: EXPIRATION,
    },
    onClose: fn(),
    className: "w-full",
  },
};
