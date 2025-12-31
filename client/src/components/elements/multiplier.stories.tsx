import type { Meta, StoryObj } from "@storybook/react-vite";
import { Multiplier } from "./multiplier";

// Import constants for default values
const ANIMATION_FRAMES = 60;
const CORNER_RADIUS = 8;
const SAFETY_MARGIN_MIN = 2;
const SAFETY_MARGIN_MAX = 2;
const NOISE_POINTS_MIN = 128;
const NOISE_POINTS_MAX = 256;
const NOISE_AMPLITUDE_MIN = 0.15;
const NOISE_AMPLITUDE_MAX = 0.5;
const BORDER_WIDTH_MIN = 2;
const BORDER_WIDTH_MAX = 5;

const meta = {
  title: "Elements/Multiplier",
  component: Multiplier,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "80px", height: "80px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    count: {
      control: { type: "number", min: 1, max: 10 },
      description: "Multiplier count value",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "Component size",
    },
    // Animation constants
    animationFrames: {
      control: { type: "range", min: 10, max: 120, step: 10 },
      description: "Number of animation frames (higher = smoother)",
    },
    cornerRadius: {
      control: { type: "range", min: 0, max: 20, step: 1 },
      description: "Corner radius in pixels (equivalent to rounded-lg)",
    },
    // Safety margin bounds
    safetyMarginMin: {
      control: { type: "range", min: 0, max: 10, step: 0.5 },
      description: "Minimum safety margin (in %)",
    },
    safetyMarginMax: {
      control: { type: "range", min: 0, max: 10, step: 0.5 },
      description: "Maximum safety margin (in %)",
    },
    // Noise points bounds
    noisePointsMin: {
      control: { type: "range", min: 32, max: 512, step: 16 },
      description: "Minimum polygon points (fewer = more chaotic)",
    },
    noisePointsMax: {
      control: { type: "range", min: 32, max: 512, step: 16 },
      description: "Maximum polygon points (more = smoother)",
    },
    // Noise amplitude bounds
    noiseAmplitudeMin: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Minimum noise amplitude (0-1)",
    },
    noiseAmplitudeMax: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Maximum noise amplitude (0-1)",
    },
    // Border width bounds
    borderWidthMin: {
      control: { type: "range", min: 1, max: 10, step: 0.5 },
      description: "Minimum border width (in %)",
    },
    borderWidthMax: {
      control: { type: "range", min: 1, max: 10, step: 0.5 },
      description: "Maximum border width (in %)",
    },
  },
} satisfies Meta<typeof Multiplier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    size: "md",
    animationFrames: ANIMATION_FRAMES,
    cornerRadius: CORNER_RADIUS,
    safetyMarginMin: SAFETY_MARGIN_MIN,
    safetyMarginMax: SAFETY_MARGIN_MAX,
    noisePointsMin: NOISE_POINTS_MIN,
    noisePointsMax: NOISE_POINTS_MAX,
    noiseAmplitudeMin: NOISE_AMPLITUDE_MIN,
    noiseAmplitudeMax: NOISE_AMPLITUDE_MAX,
    borderWidthMin: BORDER_WIDTH_MIN,
    borderWidthMax: BORDER_WIDTH_MAX,
  },
};

export const Magnitude2: Story = {
  args: {
    ...Default.args,
    count: 2,
  },
};

export const Magnitude3: Story = {
  args: {
    ...Default.args,
    count: 3,
  },
};

export const Magnitude4: Story = {
  args: {
    ...Default.args,
    count: 4,
  },
};

export const Magnitude5: Story = {
  args: {
    ...Default.args,
    count: 5,
  },
};

export const HighAmplitude: Story = {
  args: {
    ...Default.args,
    count: 5,
    noiseAmplitudeMin: 0.3,
    noiseAmplitudeMax: 0.8,
  },
};

export const ThickBorder: Story = {
  args: {
    ...Default.args,
    count: 3,
    borderWidthMin: 5,
    borderWidthMax: 10,
  },
};

export const SmoothAnimation: Story = {
  args: {
    ...Default.args,
    count: 3,
    animationFrames: 120,
    noisePointsMin: 256,
    noisePointsMax: 512,
  },
};
