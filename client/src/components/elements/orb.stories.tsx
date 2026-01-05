import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb } from "./orb";

const meta: Meta<typeof Orb> = {
  title: "Elements/Orb",
  component: Orb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bomb", "point", "multiplier", "chip", "moonrock"],
    },
    size: {
      control: "select",
      options: ["md"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Orb>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "md",
  },
};

export const Bomb: Story = {
  args: {
    variant: "bomb",
    size: "md",
  },
};

export const Point: Story = {
  args: {
    variant: "point",
    size: "md",
  },
};

export const Multiplier: Story = {
  args: {
    variant: "multiplier",
    size: "md",
  },
};

export const Chip: Story = {
  args: {
    variant: "chip",
    size: "md",
  },
};

export const Moonrock: Story = {
  args: {
    variant: "moonrock",
    size: "md",
  },
};
