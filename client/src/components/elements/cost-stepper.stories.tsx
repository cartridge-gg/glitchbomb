import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CostStepper } from "./cost-stepper";

const meta = {
  title: "Elements/CostStepper",
  component: CostStepper,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] bg-black p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CostStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [index, setIndex] = useState(0);
    return (
      <CostStepper
        count={8}
        selectedIndex={index}
        onDecrement={() => setIndex((i) => Math.max(0, i - 1))}
        onIncrement={() => setIndex((i) => Math.min(7, i + 1))}
      />
    );
  },
};

export const MidSelected: Story = {
  render: () => {
    const [index, setIndex] = useState(3);
    return (
      <CostStepper
        count={8}
        selectedIndex={index}
        onDecrement={() => setIndex((i) => Math.max(0, i - 1))}
        onIncrement={() => setIndex((i) => Math.min(7, i + 1))}
      />
    );
  },
};

export const MaxSelected: Story = {
  render: () => {
    const [index, setIndex] = useState(7);
    return (
      <CostStepper
        count={8}
        selectedIndex={index}
        onDecrement={() => setIndex((i) => Math.max(0, i - 1))}
        onIncrement={() => setIndex((i) => Math.min(7, i + 1))}
      />
    );
  },
};
