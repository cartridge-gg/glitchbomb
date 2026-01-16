import type { Meta, StoryObj } from "@storybook/react-vite";
import { CashOutConfirmation } from "./cash-out-confirmation";

const meta = {
  title: "Containers/CashOutConfirmation",
  component: CashOutConfirmation,
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
    moonrocks: {
      control: { type: "number" },
      description: "Current moonrocks balance",
    },
    points: {
      control: { type: "number" },
      description: "Points earned in game",
    },
  },
  args: {
    moonrocks: 100,
    points: 50,
    onConfirm: () => console.log("Confirmed cash out"),
    onCancel: () => console.log("Cancelled"),
  },
} satisfies Meta<typeof CashOutConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const LowTotal: Story = {
  args: {
    moonrocks: 80,
    points: 5,
  },
};

export const HighTotal: Story = {
  args: {
    moonrocks: 100,
    points: 500,
  },
};
