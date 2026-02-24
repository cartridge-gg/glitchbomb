import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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
  },
  args: {
    tierIndex: 0,
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

export const Interactive = () => {
  const [tierIndex, setTierIndex] = useState(0);
  return (
    <div className="h-screen bg-green-950 p-4">
      <div className="max-w-md mx-auto">
        <GameDetails tierIndex={tierIndex} onTierIndexChange={setTierIndex} />
      </div>
    </div>
  );
};
