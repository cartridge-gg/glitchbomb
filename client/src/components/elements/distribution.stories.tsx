import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Distribution, type DistributionValues } from "./distribution";

const meta: Meta<typeof Distribution> = {
  title: "Elements/Distribution",
  component: Distribution,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    values: {
      control: "object",
      description:
        "Object with bombs, points, multipliers, health, and special values",
    },
    size: {
      control: { type: "range", min: 100, max: 400, step: 10 },
      description: "Size of the chart in pixels",
    },
    thickness: {
      control: { type: "range", min: 10, max: 100, step: 5 },
      description: "Thickness of the ring in pixels",
    },
  },
  args: {
    values: {
      bombs: 40,
      points: 30,
      multipliers: 30,
      special: 30,
      health: 30,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Distribution>;

export const Default: Story = {};

export const SingleType: Story = {
  args: {
    values: {
      bombs: 100,
      points: 0,
      multipliers: 0,
      special: 0,
      health: 0,
    },
  },
};

export const SkewedDistribution: Story = {
  args: {
    values: {
      bombs: 5,
      points: 80,
      multipliers: 10,
      special: 5,
      health: 0,
    },
  },
};

// Story with real-time random updates
export const Animated = () => {
  const [values, setValues] = useState<DistributionValues>({
    bombs: 30,
    points: 20,
    multipliers: 50,
    special: 15,
    health: 15,
  });

  const randomize = () => {
    setValues({
      bombs: Math.floor(Math.random() * 50) + 10,
      points: Math.floor(Math.random() * 50) + 10,
      multipliers: Math.floor(Math.random() * 50) + 10,
      special: Math.floor(Math.random() * 50) + 10,
      health: Math.floor(Math.random() * 50) + 10,
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Distribution values={values} size={450} thickness={75} />

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={randomize}
          className="px-6 py-2 bg-green-950 text-white rounded-lg hover:bg-green-600 transition-colors"
          type="button"
        >
          Randomize
        </button>

        <div className="text-sm text-gray-400">
          B:{values.bombs} P:{values.points} M:{values.multipliers} S:
          {values.special}
        </div>
      </div>
    </div>
  );
};
