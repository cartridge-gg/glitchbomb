import type { Meta, StoryObj } from "@storybook/react-vite";
import { PointsProgress } from "./points-progress";

const meta = {
  title: "Elements/PointsProgress",
  component: PointsProgress,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-green-950 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    points: {
      control: { type: "range", min: 0, max: 500, step: 5 },
      description: "Current points",
    },
    milestone: {
      control: { type: "number" },
      description: "Target milestone points",
    },
  },
  args: {
    points: 45,
    milestone: 100,
  },
} satisfies Meta<typeof PointsProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const JustStarted: Story = {
  args: {
    points: 5,
    milestone: 12,
  },
};

export const AlmostComplete: Story = {
  args: {
    points: 95,
    milestone: 100,
  },
};

export const Complete: Story = {
  args: {
    points: 100,
    milestone: 100,
  },
};

export const HighMilestone: Story = {
  args: {
    points: 250,
    milestone: 500,
  },
};

export const Zero: Story = {
  args: {
    points: 0,
    milestone: 12,
  },
};
