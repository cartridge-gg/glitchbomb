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
    multiplier: 1,
    payout: "+$0.70",
    to: "/",
    onClick: fn(),
  },
} satisfies Meta<typeof GameActivity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multipliers: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <GameActivity {...args} multiplier={1} />
      <GameActivity {...args} multiplier={2} />
      <GameActivity {...args} multiplier={4} />
      <GameActivity {...args} multiplier={6} />
      <GameActivity {...args} multiplier={8} />
      <GameActivity {...args} multiplier={10} />
    </div>
  ),
};
