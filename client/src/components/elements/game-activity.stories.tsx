import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";
import { GameActivity } from "./game-activity";

const meta = {
  title: "Elements/Game Activity",
  component: GameActivity,
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
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["cashedOut", "glitched", "expired"],
    },
    moonrocks: { control: "number" },
  },
  args: {
    gameId: "#24",
    moonrocks: 320,
    payout: "+$0.70",
    to: "/",
    onClick: fn(),
  },
} satisfies Meta<typeof GameActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Glitched: Story = {
  args: {
    variant: "glitched",
  },
};

export const Expired: Story = {
  args: {
    variant: "expired",
  },
};
