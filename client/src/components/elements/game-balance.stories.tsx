import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameBalance } from "./game-balance";

const meta = {
  title: "Elements/Game Balance",
  component: GameBalance,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    value: {
      control: "number",
      description: "The balance value to display",
    },
    variant: {
      control: "select",
      options: ["moonrocks", "chips"],
      description: "The visual variant",
    },
  },
  args: {
    value: 100,
  },
} satisfies Meta<typeof GameBalance>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Moonrocks: Story = {
  args: {
    variant: "moonrocks",
    value: 100,
  },
};

export const Chips: Story = {
  args: {
    variant: "chips",
    value: 100,
  },
};
