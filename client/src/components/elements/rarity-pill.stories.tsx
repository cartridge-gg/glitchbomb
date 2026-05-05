import type { Meta, StoryObj } from "@storybook/react-vite";
import { RarityPill } from "./rarity-pill";

const meta = {
  title: "Elements/Rarity Pill",
  component: RarityPill,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["common", "rare", "cosmic"],
      description: "Rarity variant",
    },
  },
  args: {
    variant: "common",
  },
} satisfies Meta<typeof RarityPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = {
  args: {
    variant: "common",
  },
};

export const Rare: Story = {
  args: {
    variant: "rare",
  },
};

export const Cosmic: Story = {
  args: {
    variant: "cosmic",
  },
};
