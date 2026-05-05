import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { GameChart, type GameChartDataPoint } from "./game-chart";

const meta: Meta<typeof GameChart> = {
  title: "Elements/Game Chart",
  component: GameChart,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="w-full h-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GameChart>;

const screenshotData: GameChartDataPoint[] = [
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

const winningData: GameChartDataPoint[] = [
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

const losingData: GameChartDataPoint[] = [
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

const mixedColors: GameChartDataPoint[] = [
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

const shortData: GameChartDataPoint[] = [
  { value: 10, variant: "green" },
  { value: -5, variant: "red" },
  { value: 20, variant: "blue" },
];

export const FewPoints: Story = {
  args: {
    data: shortData,
  },
};

export const SinglePoint: Story = {
  args: {
    data: [{ value: 50, variant: "green" }],
  },
};

const volatileData: GameChartDataPoint[] = [
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

const potentialMoonrocksData: GameChartDataPoint[] = [
  { value: 0, variant: "green", id: 0 },
  { value: 15, variant: "green", id: 1 },
  { value: 30, variant: "green", id: 2 },
  { value: 30, variant: "red", id: 3 },
  { value: 50, variant: "green", id: 4 },
  { value: 65, variant: "yellow", id: 5 },
  { value: 65, variant: "red", id: 6 },
  { value: 100, variant: "green", id: 7 },
  { value: 115, variant: "blue", id: 8 },
  { value: 150, variant: "green", id: 9 },
  { value: 150, variant: "red", id: 10 },
  { value: 180, variant: "green", id: 11 },
  { value: 220, variant: "green", id: 12 },
];

export const PotentialMoonrocks: Story = {
  args: {
    data: potentialMoonrocksData,
    mode: "absolute",
    title: "POTENTIAL",
  },
};

const InteractiveGameChart = () => {
  const [data, setData] = useState<GameChartDataPoint[]>([
    { value: 20, variant: "green", id: 1 },
    { value: -10, variant: "red", id: 2 },
    { value: 30, variant: "blue", id: 3 },
  ]);
  const [nextId, setNextId] = useState(4);

  const addRandomPoint = () => {
    const variants: GameChartDataPoint["variant"][] = [
      "green",
      "red",
      "blue",
      "yellow",
    ];
    const newPoint: GameChartDataPoint = {
      value: Math.floor(Math.random() * 80) - 30,
      variant: variants[Math.floor(Math.random() * variants.length)],
      id: nextId,
    };
    setData((prev) => [...prev, newPoint]);
    setNextId((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <GameChart data={data} />
      <button
        type="button"
        onClick={addRandomPoint}
        className="px-3 py-2 bg-green-900 text-green-400 rounded text-sm hover:bg-green-800 transition-colors"
      >
        Add Random
      </button>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveGameChart />,
};

const AutoAddGameChart = () => {
  const [data, setData] = useState<GameChartDataPoint[]>([
    { value: 10, variant: "green", id: 1 },
  ]);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      const variants: GameChartDataPoint["variant"][] = [
        "green",
        "red",
        "blue",
        "yellow",
      ];
      const newPoint: GameChartDataPoint = {
        value: Math.floor(Math.random() * 60) - 20,
        variant: variants[Math.floor(Math.random() * variants.length)],
        id: nextId,
      };
      setData((prev) => [...prev, newPoint].slice(-15));
      setNextId((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <GameChart data={data} />
      <p className="text-green-600 text-xs">Auto-adds every 1.5s (max 15)</p>
    </div>
  );
};

export const AutoAdd: Story = {
  render: () => <AutoAddGameChart />,
};
