import type { Meta, StoryObj } from "@storybook/react-vite";
import { PurchaseDisclaimer } from "./purchase-disclaimer";

const meta = {
  title: "Elements/Purchase Disclaimer",
  component: PurchaseDisclaimer,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta<typeof PurchaseDisclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "Games expire 24hrs after purchase.",
  },
};
