import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bomb3xIcon, ChipIcon, MoonrockIcon } from "../icons";
import { GameChoice } from "./game-choice";

const meta = {
  title: "Elements/Game Choice",
  component: GameChoice,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof GameChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 15,
    details: [
      {
        category: "curse",
        icon: <Bomb3xIcon size="md" />,
        value: "+1",
        label: "3x Bomb",
      },
      {
        category: "chips",
        icon: <ChipIcon size="md" />,
        value: "+50",
        label: "Chips",
      },
    ],
    className: "h-full",
  },
};

export const CashOut: Story = {
  args: {
    variant: "secondary",
    value: 0.42,
    details: [
      {
        category: "moonrocks",
        icon: <MoonrockIcon size="md" />,
        value: "80",
        label: "Moon Rocks",
      },
    ],
    className: "h-full",
  },
};
