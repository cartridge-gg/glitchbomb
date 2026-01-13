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
    points: {
      control: { type: "number" },
      description: "Points to cash out",
    },
  },
  args: {
    points: 150,
    onConfirm: () => console.log("Confirmed cash out"),
    onCancel: () => console.log("Cancelled"),
  },
} satisfies Meta<typeof CashOutConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const LowPoints: Story = {
  args: {
    points: 25,
  },
};

export const HighPoints: Story = {
  args: {
    points: 9999,
  },
};
