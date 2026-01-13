import type { Meta, StoryObj } from "@storybook/react-vite";
import { MilestoneReached } from "./milestone-reached";

const meta = {
  title: "Containers/MilestoneReached",
  component: MilestoneReached,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-green-950">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    milestone: {
      control: { type: "number" },
      description: "Points milestone reached",
    },
  },
  args: {
    milestone: 100,
    onCashOut: () => console.log("Cash out clicked"),
    onEnterShop: () => console.log("Enter shop clicked"),
  },
} satisfies Meta<typeof MilestoneReached>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighMilestone: Story = {
  args: {
    milestone: 500,
  },
};

export const FirstMilestone: Story = {
  args: {
    milestone: 12,
  },
};
