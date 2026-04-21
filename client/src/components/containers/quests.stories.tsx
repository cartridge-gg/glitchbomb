import type { Meta, StoryObj } from "@storybook/react-vite";
import { Quests } from "./quests";

const meta = {
  title: "Containers/Quests",
  component: Quests,
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
} satisfies Meta<typeof Quests>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuests = [
  {
    id: "quest-1",
    title: "Orb Collector",
    description: "Pull 10 point orbs across any runs.",
    count: 4,
    total: 10,
  },
  {
    id: "quest-2",
    title: "Cash Out",
    description: "Cash out before losing all hearts.",
    count: 1,
    total: 1,
  },
  {
    id: "quest-3",
    title: "Bomb Tech",
    description: "Survive 3 bomb hits in a single run.",
    count: 2,
    total: 3,
  },
];

export const Default: Story = {
  args: {
    quests: sampleQuests,
  },
};

export const Empty: Story = {
  args: {
    quests: [],
  },
};
