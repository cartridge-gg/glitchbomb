import type { Meta, StoryObj } from "@storybook/react-vite";
import { MilestoneChoice } from "./milestone-choice";

const meta = {
  title: "Elements/MilestoneChoice",
  component: MilestoneChoice,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] bg-green-950 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    points: {
      control: { type: "number" },
      description: "Current points (will become chips or moonrocks)",
    },
    isEnteringShop: {
      control: { type: "boolean" },
      description: "Whether entering shop is in progress",
    },
    isCashingOut: {
      control: { type: "boolean" },
      description: "Whether cashing out is in progress",
    },
  },
  args: {
    points: 50,
    onCashOut: () => console.log("Cash out clicked"),
    onEnterShop: () => console.log("Enter shop clicked"),
    isEnteringShop: false,
    isCashingOut: false,
  },
} satisfies Meta<typeof MilestoneChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighPoints: Story = {
  args: {
    points: 150,
  },
};

export const LowPoints: Story = {
  args: {
    points: 12,
  },
};

export const EnteringShop: Story = {
  args: {
    points: 50,
    isEnteringShop: true,
  },
};

export const CashingOut: Story = {
  args: {
    points: 50,
    isCashingOut: true,
  },
};
