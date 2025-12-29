import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { Puller } from "./puller";

const meta = {
  title: "Elements/Puller",
  component: Puller,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "bomb",
        "point",
        "multiplier",
        "chip",
        "moonrock",
        "rainbow",
      ],
      description: "Visual variant of the puller",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "Size of the puller component",
    },
    orbs: {
      control: "number",
      description: "Number of orbs",
    },
    lives: {
      control: "number",
      description: "Number of lives",
    },
    disabled: {
      control: "boolean",
      description: "Disable the button",
    },
  },
  args: {
    orbs: 5,
    lives: 5,
    onClick: fn(),
  },
} satisfies Meta<typeof Puller>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    orbs: 3,
    lives: 2,
  },
};

export const Point: Story = {
  args: {
    variant: "point",
    size: "md",
    orbs: 8,
    lives: 1,
  },
};

export const Multiplier: Story = {
  args: {
    variant: "multiplier",
    size: "md",
    orbs: 4,
    lives: 3,
  },
};

export const Chip: Story = {
  args: {
    variant: "chip",
    size: "md",
    orbs: 6,
    lives: 4,
  },
};

export const Moonrock: Story = {
  args: {
    variant: "moonrock",
    size: "md",
    orbs: 2,
    lives: 5,
  },
};

export const Rainbow: Story = {
  args: {
    variant: "rainbow",
    size: "md",
    orbs: 10,
    lives: 3,
  },
};

export const NoStats: Story = {
  args: {
    variant: "default",
    size: "md",
    orbs: 0,
    lives: 0,
  },
};

export const Disabled: Story = {
  args: {
    variant: "default",
    size: "md",
    disabled: true,
  },
};
