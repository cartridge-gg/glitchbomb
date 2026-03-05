import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { GameStartedToast } from "./game-started-toast";

const players = [
  { username: "Clicksave", stake: 1 },
  { username: "Nasr", stake: 5 },
  { username: "Bal7hazar", stake: 3 },
  { username: "Shinobi", stake: 10 },
];

function ToastTrigger({
  gameId,
  username,
  stake,
}: {
  gameId: number;
  username: string;
  stake: number;
}) {
  const counterRef = useRef(0);

  const fire = useCallback(() => {
    toast.custom(
      () => (
        <GameStartedToast gameId={gameId} username={username} stake={stake} />
      ),
      {
        duration: 5000,
        unstyled: true,
        className:
          "w-full rounded-xl bg-[#092604] px-4 py-3 relative overflow-hidden",
      },
    );
  }, [gameId, username, stake]);

  const fireRandom = useCallback(() => {
    const player = players[counterRef.current % players.length];
    counterRef.current += 1;
    toast.custom(
      () => (
        <GameStartedToast
          gameId={Math.floor(Math.random() * 1000)}
          username={player.username}
          stake={player.stake}
        />
      ),
      {
        duration: 5000,
        unstyled: true,
        className:
          "w-full rounded-xl bg-[#092604] px-4 py-3 relative overflow-hidden",
      },
    );
  }, []);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        type="button"
        onClick={fire}
        style={{
          background: "#22c55e",
          color: "#000",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: 700,
          cursor: "pointer",
          border: "none",
          fontSize: "0.875rem",
        }}
      >
        Fire Toast
      </button>
      <button
        type="button"
        onClick={fireRandom}
        style={{
          background: "#6366F1",
          color: "#fff",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          fontWeight: 700,
          cursor: "pointer",
          border: "none",
          fontSize: "0.875rem",
        }}
      >
        Fire Random
      </button>
    </div>
  );
}

const meta = {
  title: "Elements/GameStartedToast",
  component: ToastTrigger,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
        <Toaster position="top-center" expand visibleToasts={4} richColors />
      </BrowserRouter>
    ),
  ],
  args: {
    gameId: 42,
    username: "Clicksave",
    stake: 1,
  },
} satisfies Meta<typeof ToastTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighStake: Story = {
  args: {
    gameId: 999,
    username: "Nasr",
    stake: 10,
  },
};
