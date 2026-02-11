import type { Meta, StoryObj } from "@storybook/react-vite";
import { CashOutChoice } from "./cash-out-choice";

const meta = {
  title: "Elements/CashOutChoice",
  component: CashOutChoice,
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
    moonrocks: {
      control: { type: "number" },
      description: "Current pack moonrocks",
    },
    points: {
      control: { type: "number" },
      description: "Current game points (mapped through payout curve)",
    },
    isConfirming: {
      control: { type: "boolean" },
      description: "Whether cash out confirmation is in progress",
    },
  },
  args: {
    moonrocks: 100,
    points: 50,
    isConfirming: false,
    onConfirm: () => console.log("Cash out confirmed"),
    onCancel: () => console.log("Cash out canceled"),
  },
} satisfies Meta<typeof CashOutChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const HighPoints: Story = {
  args: {
    points: 180,
  },
};

export const Confirming: Story = {
  args: {
    isConfirming: true,
  },
};
