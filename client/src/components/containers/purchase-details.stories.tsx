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
    price: 2.0,
    baseMaxPayout: 11.0,
    realMaxPayout: 11.11,
  },
};

export const Boosted: Story = {
  args: {
    price: 10.0,
    baseMaxPayout: 54.0,
    realMaxPayout: 56.7,
  },
};

export const Loading: Story = {
  args: {
    price: 2.0,
    baseMaxPayout: 0,
    realMaxPayout: 0,
    loading: true,
  },
};
