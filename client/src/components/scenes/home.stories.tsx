import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";
import type {
  GameActivitiesProps,
  GameCardsGame,
  GameCardsProps,
} from "@/components/containers";
import type { BannerProps } from "@/components/elements";
import {
  glitchBombConfig,
  lootSurvivorConfig,
} from "../elements/banner.fixtures";
import { HomeScene, type HomeSceneProps } from "./home";

const NOW = Math.floor(Date.now() / 1000);
const HOUR = 3600;
const DAY = 24 * HOUR;

const formatExpiry = (createdAt: number) => {
  if (!createdAt) return "--";
  const remaining = createdAt + 86400 - NOW;
  if (remaining <= 0) return "EXPIRED";
  const hours = Math.floor(remaining / HOUR);
  const minutes = Math.floor((remaining % HOUR) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatMaxPayout = (stake: number) => `$${(stake * 4.2).toFixed(2)}`;

type ActivityItem = GameActivitiesProps["activities"][number];

const sampleActiveGames: GameCardsGame[] = [
  {
    id: 1042,
    moonrocks: 128,
    points: 45,
    created_at: NOW - 2 * HOUR,
    multiplier: 2,
    stake: 3,
  },
  {
    id: 1039,
    moonrocks: 76,
    points: 12,
    created_at: NOW - 8 * HOUR,
    multiplier: 1,
    stake: 1,
  },
  {
    id: 1036,
    moonrocks: 240,
    points: 88,
    created_at: NOW - 20 * HOUR,
    multiplier: 3,
    stake: 5,
  },
];

const samplePlayerActivities: ActivityItem[] = [
  {
    gameId: "#1030",
    moonrocks: 180,
    payout: "$5.20",
    to: "/play?game=1030&view=true",
    variant: "default",
    timestamp: NOW - 1 * HOUR,
  },
  {
    gameId: "#1028",
    moonrocks: 42,
    payout: "GLITCHED",
    to: "/play?game=1028&view=true",
    variant: "glitched",
    timestamp: NOW - 4 * HOUR,
  },
  {
    gameId: "#1022",
    moonrocks: 95,
    payout: "EXPIRED",
    to: "/play?game=1022&view=true",
    variant: "expired",
    timestamp: NOW - 1 * DAY,
  },
  {
    gameId: "#1021",
    moonrocks: 312,
    payout: "$12.40",
    to: "/play?game=1021&view=true",
    variant: "default",
    timestamp: NOW - 1 * DAY - 6 * HOUR,
  },
  {
    gameId: "#1009",
    moonrocks: 18,
    payout: "GLITCHED",
    to: "/play?game=1009&view=true",
    variant: "glitched",
    timestamp: NOW - 3 * DAY,
  },
];

const sampleAllActivities: ActivityItem[] = [
  {
    gameId: "#9142",
    moonrocks: 512,
    payout: "$24.60",
    to: "/play?game=9142&view=true",
    variant: "default",
    timestamp: NOW - 30 * 60,
  },
  {
    gameId: "#9140",
    moonrocks: 224,
    payout: "$8.40",
    to: "/play?game=9140&view=true",
    variant: "default",
    timestamp: NOW - 2 * HOUR,
  },
  {
    gameId: "#9137",
    moonrocks: 68,
    payout: "GLITCHED",
    to: "/play?game=9137&view=true",
    variant: "glitched",
    timestamp: NOW - 5 * HOUR,
  },
  {
    gameId: "#9132",
    moonrocks: 156,
    payout: "$6.10",
    to: "/play?game=9132&view=true",
    variant: "default",
    timestamp: NOW - 9 * HOUR,
  },
  {
    gameId: "#9101",
    moonrocks: 44,
    payout: "EXPIRED",
    to: "/play?game=9101&view=true",
    variant: "expired",
    timestamp: NOW - 1 * DAY,
  },
  {
    gameId: "#9098",
    moonrocks: 388,
    payout: "$15.80",
    to: "/play?game=9098&view=true",
    variant: "default",
    timestamp: NOW - 1 * DAY - 4 * HOUR,
  },
];

const sampleBanners: BannerProps[] = [
  {
    preset: "glitch-bomb",
    name: "social",
    config: glitchBombConfig,
    onClick: fn(),
  },
  {
    preset: "loot-survivor",
    name: "tutorial",
    config: lootSurvivorConfig,
    position: 64,
    onClick: fn(),
  },
];

const buildGamesProps = (
  activeGames: GameCardsGame[],
  loadingGameId: number | null,
): Omit<GameCardsProps, "gameId" | "setGameId"> => ({
  activeGames,
  loadingGameId,
  formatExpiry,
  formatMaxPayout,
  onPlay: fn(),
  onNewGame: fn(),
  onPractice: fn(),
  requireLogin: fn((action: () => void) => action()),
});

const meta = {
  title: "Scenes/Home",
  component: HomeScene,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="flex h-screen w-full flex-col">
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
  args: {
    onBuyGame: fn(),
    onShowDetailsChange: fn(),
  },
  render: (args: HomeSceneProps) => {
    const initialId = args.gamesProps.activeGames[0]?.id;
    const [gameId, setGameId] = useState<number | undefined>(initialId);
    return (
      <HomeScene
        {...args}
        gamesProps={{ ...args.gamesProps, gameId, setGameId }}
      />
    );
  },
} satisfies Meta<typeof HomeScene>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gamesProps: {
      ...buildGamesProps(sampleActiveGames, null),
      gameId: sampleActiveGames[0].id,
      setGameId: fn(),
    },
    allActivities: { activities: sampleAllActivities },
    playerActivities: { activities: samplePlayerActivities },
    banners: sampleBanners,
    showDetails: false,
  },
};

export const Empty: Story = {
  args: {
    gamesProps: {
      ...buildGamesProps([], null),
      gameId: undefined,
      setGameId: fn(),
    },
    allActivities: { activities: [] },
    playerActivities: { activities: [] },
    banners: sampleBanners,
    showDetails: false,
  },
};
