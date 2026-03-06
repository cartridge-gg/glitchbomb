import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ActivityItem } from "@/hooks/activity-feed";
import { ActivityTicker } from "./activity-ticker";

const mockItems: ActivityItem[] = [
  {
    id: "start-1",
    type: "game_started",
    username: "Clicksave",
    stake: 1,
    timestamp: Date.now(),
  },
  {
    id: "cashout-2",
    type: "cash_out",
    username: "Nasr",
    moonrocks: 120,
    timestamp: Date.now() - 1000,
  },
  {
    id: "start-3",
    type: "game_started",
    username: "Bal7hazar",
    stake: 5,
    timestamp: Date.now() - 2000,
  },
  {
    id: "cashout-4",
    type: "cash_out",
    username: "Shinobi",
    moonrocks: 340,
    timestamp: Date.now() - 3000,
  },
  {
    id: "start-5",
    type: "game_started",
    username: "0xDev",
    stake: 10,
    timestamp: Date.now() - 4000,
  },
  {
    id: "cashout-6",
    type: "cash_out",
    username: "CairoMaster",
    moonrocks: 55,
    timestamp: Date.now() - 5000,
  },
];

const meta = {
  title: "Elements/ActivityTicker",
  component: ActivityTicker,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div
        style={{ background: "#050505", minHeight: "100px", paddingTop: 20 }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActivityTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockItems,
  },
};

export const FewItems: Story = {
  args: {
    items: mockItems.slice(0, 2),
  },
};

export const SingleItem: Story = {
  args: {
    items: mockItems.slice(0, 1),
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      ...mockItems,
      {
        id: "start-7",
        type: "game_started",
        username: "StarkWhale",
        stake: 3,
        timestamp: Date.now() - 6000,
      },
      {
        id: "cashout-8",
        type: "cash_out",
        username: "DojoDev",
        moonrocks: 480,
        timestamp: Date.now() - 7000,
      },
      {
        id: "start-9",
        type: "game_started",
        username: "LordFelt",
        stake: 7,
        timestamp: Date.now() - 8000,
      },
    ],
  },
};
