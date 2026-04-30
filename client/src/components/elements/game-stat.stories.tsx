import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameStat } from "./game-stat";

const meta = {
  title: "Elements/Game Stat",
  component: GameStat,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["health", "goal"],
      description:
        "Visual theme: health (salmon + heart) or goal (green + sparkle)",
    },
    value: {
      control: { type: "number" },
      description: "Current value displayed next to the icon",
    },
    max: {
      control: { type: "number" },
      description: "Denominator used to fill the progress bar (value / max)",
    },
  },
  args: {
    variant: "health",
    value: 5,
    max: 5,
  },
} satisfies Meta<typeof GameStat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Health: Story = {
  args: { variant: "health", value: 5, max: 5 },
};

export const HealthLow: Story = {
  args: { variant: "health", value: 2, max: 5 },
};

export const HealthEmpty: Story = {
  args: { variant: "health", value: 0, max: 5 },
};

export const Goal: Story = {
  args: { variant: "goal", value: 90, max: 180 },
};

export const GoalReached: Story = {
  args: { variant: "goal", value: 180, max: 180 },
};

export const GoalEarly: Story = {
  args: { variant: "goal", value: 1, max: 12 },
};
