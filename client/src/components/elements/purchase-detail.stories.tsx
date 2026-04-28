import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseDetail } from "./purchase-detail";

const meta = {
  title: "Elements/Purchase Detail",
  component: PurchaseDetail,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof PurchaseDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Entry Fee",
    content: "$2.00",
  },
};

export const Discount: Story = {
  args: {
    title: "Maximum Reward",
    content: "$11.20",
    previous: "$11.00",
    discount: "+1%",
  },
};
