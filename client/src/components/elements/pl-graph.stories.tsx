import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { type PLDataPoint, PLGraph } from "./pl-graph";

const meta: Meta<typeof PLGraph> = {
  title: "Elements/PLGraph",
  component: PLGraph,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0a0f0a" }],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PLGraph>;

// Sample data matching the screenshot pattern
const screenshotData: PLDataPoint[] = [
  { value: -10, variant: "yellow" },
  { value: -15, variant: "green" },
  { value: -5, variant: "red" },
  { value: 25, variant: "green" },
  { value: -10, variant: "yellow" },
  { value: -5, variant: "red" },
  { value: 50, variant: "green" },
  { value: -15, variant: "red" },
  { value: 20, variant: "green" },
  { value: -10, variant: "red" },
  { value: -5, variant: "blue" },
  { value: 15, variant: "green" },
  { value: -10, variant: "red" },
  { value: 80, variant: "green" },
  { value: -30, variant: "red" },
  { value: -10, variant: "green" },
  { value: -5, variant: "red" },
  { value: 30, variant: "green" },
  { value: -10, variant: "red" },
  { value: -5, variant: "blue" },
  { value: 45, variant: "green" },
  { value: -15, variant: "yellow" },
  { value: -10, variant: "red" },
];

export const Default: Story = {
  args: {
    data: screenshotData,
  },
};

// Winning streak
const winningData: PLDataPoint[] = [
  { value: 10, variant: "green" },
  { value: 15, variant: "green" },
  { value: 20, variant: "green" },
  { value: -5, variant: "red" },
  { value: 25, variant: "green" },
  { value: 30, variant: "green" },
  { value: -10, variant: "red" },
  { value: 35, variant: "green" },
  { value: 40, variant: "green" },
  { value: 50, variant: "green" },
];

export const WinningStreak: Story = {
  args: {
    data: winningData,
  },
};

// Losing streak
const losingData: PLDataPoint[] = [
  { value: -10, variant: "red" },
  { value: -15, variant: "red" },
  { value: 5, variant: "green" },
  { value: -20, variant: "red" },
  { value: -25, variant: "red" },
  { value: 10, variant: "green" },
  { value: -30, variant: "red" },
  { value: -15, variant: "red" },
  { value: -20, variant: "red" },
];

export const LosingStreak: Story = {
  args: {
    data: losingData,
  },
};

// Mixed colors
const mixedColors: PLDataPoint[] = [
  { value: 20, variant: "green" },
  { value: -10, variant: "red" },
  { value: 15, variant: "blue" },
  { value: -5, variant: "yellow" },
  { value: 30, variant: "green" },
  { value: -20, variant: "red" },
  { value: 25, variant: "blue" },
  { value: -15, variant: "yellow" },
  { value: 40, variant: "green" },
  { value: -10, variant: "red" },
  { value: 20, variant: "blue" },
  { value: -5, variant: "yellow" },
];

export const MixedColors: Story = {
  args: {
    data: mixedColors,
  },
};

// Short data (few points)
const shortData: PLDataPoint[] = [
  { value: 10, variant: "green" },
  { value: -5, variant: "red" },
  { value: 20, variant: "blue" },
];

export const FewPoints: Story = {
  args: {
    data: shortData,
  },
};

// Single point
export const SinglePoint: Story = {
  args: {
    data: [{ value: 50, variant: "green" }],
  },
};

// Volatile data with large swings
const volatileData: PLDataPoint[] = [
  { value: 100, variant: "green" },
  { value: -80, variant: "red" },
  { value: 120, variant: "green" },
  { value: -90, variant: "red" },
  { value: 150, variant: "green" },
  { value: -100, variant: "red" },
  { value: 80, variant: "green" },
  { value: -60, variant: "red" },
  { value: 200, variant: "green" },
  { value: -50, variant: "red" },
];

export const Volatile: Story = {
  args: {
    data: volatileData,
  },
};

// Net zero
const netZeroData: PLDataPoint[] = [
  { value: 30, variant: "green" },
  { value: -30, variant: "red" },
  { value: 20, variant: "blue" },
  { value: -20, variant: "yellow" },
  { value: 50, variant: "green" },
  { value: -50, variant: "red" },
];

export const NetZero: Story = {
  args: {
    data: netZeroData,
  },
};

// Many data points
const manyPoints: PLDataPoint[] = Array.from({ length: 30 }, () => ({
  value: Math.floor(Math.random() * 60) - 25,
  variant: (["green", "red", "blue", "yellow"] as const)[
    Math.floor(Math.random() * 4)
  ],
}));

export const ManyPoints: Story = {
  args: {
    data: manyPoints,
  },
};

// Interactive story - Add points with animation
const InteractivePLGraph = () => {
  const [data, setData] = useState<PLDataPoint[]>([
    { value: 20, variant: "green", id: 1 },
    { value: -10, variant: "red", id: 2 },
    { value: 30, variant: "blue", id: 3 },
  ]);
  const [nextId, setNextId] = useState(4);

  const addRandomPoint = () => {
    const variants: PLDataPoint["variant"][] = [
      "green",
      "red",
      "blue",
      "yellow",
    ];
    const newPoint: PLDataPoint = {
      value: Math.floor(Math.random() * 80) - 30,
      variant: variants[Math.floor(Math.random() * variants.length)],
      id: nextId,
    };
    setData((prev) => [...prev, newPoint]);
    setNextId((prev) => prev + 1);
  };

  const addWin = () => {
    const newPoint: PLDataPoint = {
      value: Math.floor(Math.random() * 50) + 10,
      variant: "green",
      id: nextId,
    };
    setData((prev) => [...prev, newPoint]);
    setNextId((prev) => prev + 1);
  };

  const addLoss = () => {
    const newPoint: PLDataPoint = {
      value: -(Math.floor(Math.random() * 30) + 5),
      variant: "red",
      id: nextId,
    };
    setData((prev) => [...prev, newPoint]);
    setNextId((prev) => prev + 1);
  };

  const reset = () => {
    setData([
      { value: 20, variant: "green", id: nextId },
      { value: -10, variant: "red", id: nextId + 1 },
      { value: 30, variant: "blue", id: nextId + 2 },
    ]);
    setNextId(nextId + 3);
  };

  return (
    <div className="flex flex-col gap-4">
      <PLGraph data={data} />
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={addRandomPoint}
          className="px-3 py-2 bg-green-900 text-green-400 rounded text-sm hover:bg-green-800 transition-colors"
        >
          Add Random
        </button>
        <button
          type="button"
          onClick={addWin}
          className="px-3 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-600 transition-colors"
        >
          Add Win (+)
        </button>
        <button
          type="button"
          onClick={addLoss}
          className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          Add Loss (-)
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
      <p className="text-green-600 text-xs">
        Points: {data.length} | Click buttons to see animation
      </p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractivePLGraph />,
};

// Auto-adding points story
const AutoAddPLGraph = () => {
  const [data, setData] = useState<PLDataPoint[]>([
    { value: 10, variant: "green", id: 1 },
  ]);
  const [nextId, setNextId] = useState(2);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const variants: PLDataPoint["variant"][] = [
        "green",
        "red",
        "blue",
        "yellow",
      ];
      const newPoint: PLDataPoint = {
        value: Math.floor(Math.random() * 60) - 20,
        variant: variants[Math.floor(Math.random() * variants.length)],
        id: nextId,
      };
      setData((prev) => {
        // Keep last 15 points
        const updated = [...prev, newPoint];
        return updated.slice(-15);
      });
      setNextId((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning, nextId]);

  return (
    <div className="flex flex-col gap-4">
      <PLGraph data={data} />
      <button
        type="button"
        onClick={() => setIsRunning(!isRunning)}
        className={`px-3 py-2 rounded text-sm transition-colors ${
          isRunning
            ? "bg-red-700 text-white hover:bg-red-600"
            : "bg-green-700 text-white hover:bg-green-600"
        }`}
      >
        {isRunning ? "Stop Auto-Add" : "Start Auto-Add"}
      </button>
      <p className="text-green-600 text-xs">
        Auto-adds a new point every 1.5s (max 15 points)
      </p>
    </div>
  );
};

export const AutoAdd: Story = {
  render: () => <AutoAddPLGraph />,
};
