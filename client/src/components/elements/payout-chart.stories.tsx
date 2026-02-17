import type { Meta, StoryObj } from "@storybook/react-vite";
import { PayoutChart } from "./payout-chart";

const meta = {
  title: "Elements/PayoutChart",
  component: PayoutChart,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] bg-black p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    entryCost: {
      control: { type: "number", step: 1 },
      description: "Entry cost in dollars (scales the entire curve)",
    },
  },
  args: {
    entryCost: 2,
  },
} satisfies Meta<typeof PayoutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FiveDollars: Story = {
  args: {
    entryCost: 5,
  },
};

export const TwentyFiveDollars: Story = {
  args: {
    entryCost: 25,
  },
};

export const HundredDollars: Story = {
  args: {
    entryCost: 100,
  },
};
