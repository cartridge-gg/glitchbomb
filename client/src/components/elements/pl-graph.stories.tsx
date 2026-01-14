import type { Meta, StoryObj } from "@storybook/react-vite";
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
