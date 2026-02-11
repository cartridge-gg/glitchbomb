import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { GameHeader } from "./game-header";

const meta = {
  title: "Containers/GameHeader",
  component: GameHeader,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    moonrocks: {
      control: { type: "number" },
      description: "Token balance (moonrocks)",
    },
    potentialMoonrocks: {
      control: { type: "number" },
      description: "Potential moonrocks while game is in progress",
    },
    chips: {
      control: { type: "number" },
      description: "In-game chips balance",
    },
    username: {
      control: { type: "text" },
      description: "Player username",
    },
  },
  args: {
    moonrocks: 1500,
    potentialMoonrocks: 1548,
    chips: 36,
    username: "Player1",
  },
} satisfies Meta<typeof GameHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCurrentBalanceOnly: Story = {
  args: {
    potentialMoonrocks: undefined,
  },
};
