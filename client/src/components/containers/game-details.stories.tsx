import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameDetails } from "./game-details";

const meta = {
  title: "Containers/GameDetails",
  component: GameDetails,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-green-950 p-4">
        <div className="max-w-md mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    tierIndex: {
      control: { type: "range", min: 0, max: 9, step: 1 },
      description: "Selected tier index (0-based)",
    },
    tokenPrice: {
      control: { type: "number" },
      description: "Token price in USD",
    },
  },
  args: {
    tierIndex: 0,
    tokenPrice: null,
  },
} satisfies Meta<typeof GameDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighTier: Story = {
  args: {
    tierIndex: 4,
  },
};

export const MaxTier: Story = {
  args: {
    tierIndex: 9,
  },
};

export const WithTokenPrice: Story = {
  args: {
    tierIndex: 2,
    tokenPrice: 0.05,
  },
};

export const Interactive = () => {
  const [tierIndex, setTierIndex] = useState(0);
  return (
    <div className="h-screen bg-green-950 p-4">
      <div className="max-w-md mx-auto">
        <GameDetails
          tierIndex={tierIndex}
          onTierIndexChange={setTierIndex}
          tokenPrice={null}
        />
      </div>
    </div>
  );
};
