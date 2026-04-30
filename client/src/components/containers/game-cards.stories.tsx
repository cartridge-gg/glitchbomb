import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { GameCards, type GameCardsGame } from "./game-cards";

const NOW = Math.floor(Date.now() / 1000);
const HOUR = 3600;
const DAY = 24 * HOUR;

const sampleActiveGames: GameCardsGame[] = [
  {
    gameId: 1042,
    moonrocks: 173,
    expiration: NOW - 2 * HOUR + DAY,
    payout: "$12.60",
  },
  {
    gameId: 1039,
    moonrocks: 88,
    expiration: NOW - 8 * HOUR + DAY,
    payout: "$4.20",
  },
  {
    gameId: 1036,
    moonrocks: 328,
    expiration: NOW - 20 * HOUR + DAY,
    payout: "$21.00",
  },
];

const newGameCard: GameCardsGame = {
  gameId: 0,
  expiration: NOW + DAY,
  payout: "$4.20",
};

const sampleGames: GameCardsGame[] = [...sampleActiveGames, newGameCard];

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
    games: sampleGames,
    gameId: sampleActiveGames[0].gameId,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const NewGameSelected: Story = {
  args: {
    games: sampleGames,
    gameId: 0,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const Loading: Story = {
  args: {
    games: sampleGames,
    gameId: sampleActiveGames[0].gameId,
    setGameId: fn(),
    loadingGameId: sampleActiveGames[0].gameId,
  },
};

export const Empty: Story = {
  args: {
    games: [newGameCard],
    gameId: undefined,
    setGameId: fn(),
    loadingGameId: null,
  },
};

export const SingleGame: Story = {
  args: {
    games: [sampleActiveGames[0], newGameCard],
    gameId: sampleActiveGames[0].gameId,
    setGameId: fn(),
    loadingGameId: null,
  },
};
