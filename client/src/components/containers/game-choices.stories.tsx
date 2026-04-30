import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bomb2xIcon, ChipIcon, MoonrockIcon } from "@/components/icons";
import { GameChoices } from "./game-choices";

const meta = {
  title: "Containers/Game Choices",
  component: GameChoices,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    continue: {
      control: { type: "object" },
      description: "Props for the Continue choice",
    },
    cashOut: {
      control: { type: "object" },
      description: "Props for the Cash Out choice",
    },
  },
} satisfies Meta<typeof GameChoices>;

export default meta;
type Story = StoryObj<typeof meta>;

const continueArgs = {
  value: 30,
  details: [
    {
      category: "chips" as const,
      icon: <ChipIcon />,
      value: "+50",
      label: "Gain Chips",
    },
    {
      category: "curse" as const,
      icon: <Bomb2xIcon className="glitch-icon" />,
      value: "+1",
      label: "2x Bomb",
    },
  ],
};

const cashOutArgs = {
  value: 1,
  details: [
    {
      category: "moonrocks" as const,
      icon: <MoonrockIcon />,
      value: "150",
      label: "Moon Rocks",
    },
  ],
};

export const Default: Story = {
  args: {
    className: "h-full",
    continue: continueArgs,
    cashOut: cashOutArgs,
  },
};

export const ContinueLoading: Story = {
  args: {
    className: "h-full",
    continue: { ...continueArgs, loading: true, disabled: true },
    cashOut: { ...cashOutArgs, disabled: true },
  },
};

export const CashOutLoading: Story = {
  args: {
    className: "h-full",
    continue: { ...continueArgs, disabled: true },
    cashOut: { ...cashOutArgs, loading: true, disabled: true },
  },
};
