import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameStartedToast } from "./game-started-toast";

const meta = {
  title: "Elements/GameStartedToast",
  component: GameStartedToast,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            width: 380,
          }}
        >
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  args: {
    gameId: 42,
    username: "ControllerFren",
    stake: 1,
  },
} satisfies Meta<typeof GameStartedToast>;

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
