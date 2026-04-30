import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseDisclaimers } from "./purchase-disclaimers";

const meta = {
  title: "Containers/Purchase Disclaimers",
  component: PurchaseDisclaimers,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof PurchaseDisclaimers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tokenPrice: 0.02,
  },
};
