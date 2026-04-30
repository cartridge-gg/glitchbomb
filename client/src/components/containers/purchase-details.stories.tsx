import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseDetails } from "./purchase-details";

const meta = {
  title: "Containers/Purchase Details",
  component: PurchaseDetails,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof PurchaseDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    basePrice: 2.0,
    entryPrice: 1.98,
    maxPayout: "$11.20",
  },
};

export const Discounted: Story = {
  args: {
    basePrice: 10.0,
    entryPrice: 9.5,
    maxPayout: "$54.00",
  },
};

export const Loading: Story = {
  args: {
    basePrice: 2.0,
    entryPrice: 1.98,
    maxPayout: "—",
    loading: true,
  },
};
