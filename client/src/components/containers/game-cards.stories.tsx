import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { GameCards, type GameCardsGame } from "./game-cards";

const NOW = Math.floor(Date.now() / 1000);
const HOUR = 3600;

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

const meta = {
  title: "Containers/Game Cards",
  component: GameCards,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    formatExpiry,
    formatMaxPayout,
    onPlay: fn(),
    onNewGame: fn(),
    onPractice: fn(),
    requireLogin: fn((action: () => void) => action()),
  },
  render: (args) => {
    const [gameId, setGameId] = useState<number | undefined>(args.gameId);
    return <GameCards {...args} gameId={gameId} setGameId={setGameId} />;
  },
} satisfies Meta<typeof GameCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeGames: sampleActiveGames,
    gameId: sampleActiveGames[0].id,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const NewGameSelected: Story = {
  args: {
    activeGames: sampleActiveGames,
    gameId: 0,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const Loading: Story = {
  args: {
    activeGames: sampleActiveGames,
    gameId: sampleActiveGames[0].id,
    setGameId: fn(),
    loadingGameId: sampleActiveGames[0].id,
  },
};

export const Empty: Story = {
  args: {
    activeGames: [],
    gameId: undefined,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const SingleGame: Story = {
  args: {
    activeGames: [sampleActiveGames[0]],
    gameId: sampleActiveGames[0].id,
    setGameId: fn(),
    loadingGameId: null,
  },
};
