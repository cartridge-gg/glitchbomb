import type { Meta, StoryObj } from "@storybook/react-vite";
import { RarityPill } from "./rarity-pill";

const meta = {
  title: "Elements/RarityPill",
  component: RarityPill,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    rarity: {
      control: { type: "select" },
      options: ["common", "rare", "cosmic"],
      description: "Rarity level",
    },
  },
  args: {
    rarity: "common",
  },
} satisfies Meta<typeof RarityPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = {
  args: {
    rarity: "common",
  },
};

export const Rare: Story = {
  args: {
    rarity: "rare",
  },
};

export const Cosmic: Story = {
  args: {
    rarity: "cosmic",
  },
};

export const AllRarities: Story = {
  render: () => (
    <div className="flex gap-4">
      <RarityPill rarity="common" />
      <RarityPill rarity="rare" />
      <RarityPill rarity="cosmic" />
    </div>
  ),
};
