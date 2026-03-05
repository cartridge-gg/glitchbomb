import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { GameStartedToast } from "./game-started-toast";

function ToastTrigger({
  gameId,
  username,
  stake,
}: {
  gameId: number;
  username: string;
  stake: number;
}) {
  const fire = useCallback(() => {
    toast.custom(
      () => (
        <GameStartedToast gameId={gameId} username={username} stake={stake} />
      ),
      {
        duration: 5000,
        style: {
          background: "#0a0a0a",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
        },
      },
    );
  }, [gameId, username, stake]);

  return (
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
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    ),
  ],
  args: {
    gameId: 42,
    username: "ControllerFren",
    stake: 1,
  },
} satisfies Meta<typeof ToastTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stake1X: Story = {};

export const Stake2X: Story = {
  args: {
    gameId: 108,
    username: "0xDeadBeef",
    stake: 2,
  },
};

export const Stake3X: Story = {
  args: {
    gameId: 999,
    username: "LongUsernamePlayer123",
    stake: 3,
  },
};
