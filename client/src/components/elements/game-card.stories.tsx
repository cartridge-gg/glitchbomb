import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GameCard } from "./game-card";

const meta = {
  title: "Elements/Game Card",
  component: GameCard,
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
  argTypes: {
    variant: {
      control: "select",
      options: ["active", "new"],
    },
    seed: {
      control: "number",
    },
    loading: {
      control: "boolean",
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof GameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    variant: "active",
    seed: 42,
    fields: [
      { label: "Moonrocks", value: "128" },
      { label: "Expires In", value: "5h 32m" },
      { label: "Game ID", value: "#1042" },
      { label: "Max Payout", value: "$12.60" },
    ],
  },
};

export const ActiveLoading: Story = {
  args: {
    variant: "active",
    seed: 42,
    loading: true,
    fields: [
      { label: "Moonrocks", value: "128" },
      { label: "Expires In", value: "5h 32m" },
      { label: "Game ID", value: "#1042" },
      { label: "Max Payout", value: "$12.60" },
    ],
  },
};

export const ActiveEmptyValues: Story = {
  args: {
    variant: "active",
    seed: 42,
    fields: [
      { label: "Moonrocks", value: "---" },
      { label: "Expires In", value: "--" },
      { label: "Game ID", value: "---" },
      { label: "Max Payout", value: "---" },
    ],
  },
};

export const New: Story = {
  args: {
    variant: "new",
    seed: 99,
    fields: [
      { label: "Moonrocks", value: "---" },
      { label: "Expires In", value: "---" },
      { label: "Multiplier", value: "---" },
      { label: "Max Payout", value: "---" },
    ],
  },
};
