import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameBalances } from "./game-balances";

const meta = {
  title: "Containers/Game Balances",
  component: GameBalances,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    moonrocks: {
      control: { type: "object" },
      description: "Props for the moonrocks balance",
    },
    chips: {
      control: { type: "object" },
      description: "Props for the chips balance",
    },
  },
} satisfies Meta<typeof GameBalances>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    moonrocks: { value: 100 },
    chips: { value: 100 },
  },
};
