import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameActivities } from "./game-activities";

const meta = {
  title: "Containers/Game Activities",
  component: GameActivities,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-full w-full">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof GameActivities>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const today = now;
const yesterday = now - 24 * 60 * 60;
const twoDaysAgo = now - 2 * 24 * 60 * 60;
const weekAgo = now - 7 * 24 * 60 * 60;

export const Default: Story = {
  args: {
    activities: [
      // Today (5 activities)
      {
        gameId: "#1144",
        payout: "+$0.72",
        to: "/game/1144",
        moonrocks: 180,
        timestamp: today,
      },
      {
        gameId: "#1145",
        payout: "+$1.25",
        to: "/game/1145",
        moonrocks: 180,
        timestamp: today - 1800, // 30 minutes ago
      },
      {
        gameId: "#1146",
        payout: "+$0.40",
        to: "/game/1146",
        moonrocks: 180,
        timestamp: today - 3600, // 1 hour ago
      },
      {
        gameId: "#1147",
        payout: "+$1.50",
        to: "/game/1147",
        moonrocks: 180,
        timestamp: today - 7200, // 2 hours ago
      },
      {
        gameId: "#1148",
        payout: "+$0.60",
        to: "/game/1148",
        moonrocks: 180,
        timestamp: today - 10800, // 3 hours ago
      },
      // Yesterday (4 activities)
      {
        gameId: "#1149",
        payout: "+$0.90",
        to: "/game/1149",
        moonrocks: 180,
        timestamp: yesterday,
      },
      {
        gameId: "#1150",
        payout: "+$1.10",
        to: "/game/1150",
        moonrocks: 180,
        timestamp: yesterday - 3600, // Yesterday, 1 hour earlier
      },
      {
        gameId: "#1151",
        payout: "+$0.80",
        to: "/game/1151",
        moonrocks: 180,
        timestamp: yesterday - 7200, // Yesterday, 2 hours earlier
      },
      {
        gameId: "#1152",
        payout: "+$1.00",
        to: "/game/1152",
        moonrocks: 180,
        timestamp: yesterday - 10800, // Yesterday, 3 hours earlier
      },
      // 2 days ago (3 activities)
      {
        gameId: "#1153",
        payout: "+$0.75",
        to: "/game/1153",
        moonrocks: 180,
        timestamp: twoDaysAgo,
      },
      {
        gameId: "#1154",
        payout: "+$1.40",
        to: "/game/1154",
        moonrocks: 180,
        timestamp: twoDaysAgo - 3600,
      },
      {
        gameId: "#1155",
        payout: "+$0.50",
        to: "/game/1155",
        moonrocks: 180,
        timestamp: twoDaysAgo - 7200,
      },
      // 3 days ago (2 activities)
      {
        gameId: "#1156",
        payout: "+$1.20",
        to: "/game/1156",
        moonrocks: 180,
        timestamp: twoDaysAgo - 24 * 60 * 60,
      },
      {
        gameId: "#1157",
        payout: "+$0.95",
        to: "/game/1157",
        moonrocks: 180,
        timestamp: twoDaysAgo - 24 * 60 * 60 - 3600,
      },
      // 4 days ago (2 activities)
      {
        gameId: "#1158",
        payout: "+$1.35",
        to: "/game/1158",
        moonrocks: 180,
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60,
      },
      {
        gameId: "#1159",
        payout: "+$0.65",
        to: "/game/1159",
        moonrocks: 180,
        timestamp: twoDaysAgo - 2 * 24 * 60 * 60 - 3600,
      },
      // Week ago (4 activities)
      {
        gameId: "#1160",
        payout: "+$1.05",
        to: "/game/1160",
        moonrocks: 180,
        timestamp: weekAgo,
      },
      {
        gameId: "#1161",
        payout: "+$0.85",
        to: "/game/1161",
        moonrocks: 180,
        timestamp: weekAgo - 3600,
      },
      {
        gameId: "#1162",
        payout: "+$1.30",
        to: "/game/1162",
        moonrocks: 180,
        timestamp: weekAgo - 7200,
      },
      {
        gameId: "#1163",
        payout: "+$0.55",
        to: "/game/1163",
        moonrocks: 180,
        timestamp: weekAgo - 10800,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
};
