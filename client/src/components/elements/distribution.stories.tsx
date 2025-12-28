import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Distribution, type DistributionValues } from "./distribution";

const meta: Meta<typeof Distribution> = {
  title: "Elements/Distribution",
  component: Distribution,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    values: {
      control: "object",
      description:
        "Object with bombs, points, multipliers, chips, and moonrocks values",
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
};

export default meta;
type Story = StoryObj<typeof Distribution>;

export const Default: Story = {
  args: {
    values: {
      bombs: 30,
      points: 20,
      multipliers: 50,
      chips: 0,
      moonrocks: 0,
    },
    size: 200,
    thickness: 30,
  },
};

export const AllTypes: Story = {
  args: {
    values: {
      bombs: 20,
      points: 25,
      multipliers: 15,
      chips: 20,
      moonrocks: 20,
    },
    size: 250,
    thickness: 40,
  },
};

export const SingleType: Story = {
  args: {
    values: {
      bombs: 100,
      points: 0,
      multipliers: 0,
      chips: 0,
      moonrocks: 0,
    },
    size: 200,
    thickness: 30,
  },
};

export const LargeChart: Story = {
  args: {
    values: {
      bombs: 40,
      points: 30,
      multipliers: 30,
      chips: 0,
      moonrocks: 0,
    },
    size: 300,
    thickness: 50,
  },
};

export const ThinRing: Story = {
  args: {
    values: {
      bombs: 30,
      points: 40,
      multipliers: 30,
      chips: 0,
      moonrocks: 0,
    },
    size: 200,
    thickness: 15,
  },
};

export const ThickRing: Story = {
  args: {
    values: {
      bombs: 20,
      points: 50,
      multipliers: 30,
      chips: 0,
      moonrocks: 0,
    },
    size: 250,
    thickness: 60,
  },
};

export const SkewedDistribution: Story = {
  args: {
    values: {
      bombs: 5,
      points: 80,
      multipliers: 10,
      chips: 5,
      moonrocks: 0,
    },
    size: 200,
    thickness: 30,
  },
};

// Interactive story with smooth transitions
export const Interactive = () => {
  const presets: DistributionValues[] = [
    { bombs: 30, points: 20, multipliers: 50, chips: 0, moonrocks: 0 },
    { bombs: 25, points: 25, multipliers: 25, chips: 25, moonrocks: 0 },
    { bombs: 10, points: 40, multipliers: 50, chips: 0, moonrocks: 0 },
    { bombs: 60, points: 20, multipliers: 10, chips: 10, moonrocks: 0 },
    { bombs: 15, points: 15, multipliers: 15, chips: 15, moonrocks: 40 },
    { bombs: 5, points: 80, multipliers: 10, chips: 5, moonrocks: 0 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState(presets[0]);

  const nextPreset = () => {
    const newIndex = (currentIndex + 1) % presets.length;
    setCurrentIndex(newIndex);
    setValues(presets[newIndex]);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Distribution values={values} size={250} thickness={40} />

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={nextPreset}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          type="button"
        >
          Change Distribution
        </button>

        <div className="text-sm text-gray-400">
          B:{values.bombs} P:{values.points} M:{values.multipliers} C:
          {values.chips} MR:{values.moonrocks}
        </div>
      </div>
    </div>
  );
};

// Story with real-time random updates
export const Animated = () => {
  const [values, setValues] = useState<DistributionValues>({
    bombs: 30,
    points: 20,
    multipliers: 50,
    chips: 15,
    moonrocks: 10,
  });

  const randomize = () => {
    setValues({
      bombs: Math.floor(Math.random() * 50) + 10,
      points: Math.floor(Math.random() * 50) + 10,
      multipliers: Math.floor(Math.random() * 50) + 10,
      chips: Math.floor(Math.random() * 50) + 10,
      moonrocks: Math.floor(Math.random() * 50) + 10,
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Distribution values={values} size={250} thickness={40} />

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={randomize}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          type="button"
        >
          Randomize
        </button>

        <div className="text-sm text-gray-400">
          B:{values.bombs} P:{values.points} M:{values.multipliers} C:
          {values.chips} MR:{values.moonrocks}
        </div>
      </div>
    </div>
  );
};

// Story showing multiple sizes side by side
export const Sizes = () => {
  const values: DistributionValues = {
    bombs: 30,
    points: 40,
    multipliers: 30,
    chips: 0,
    moonrocks: 0,
  };

  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Distribution values={values} size={150} thickness={25} />
        <div className="text-xs text-gray-400">Small (150px)</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Distribution values={values} size={200} thickness={30} />
        <div className="text-xs text-gray-400">Medium (200px)</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Distribution values={values} size={250} thickness={40} />
        <div className="text-xs text-gray-400">Large (250px)</div>
      </div>
    </div>
  );
};
