import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
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
    bombs: {
      control: "number",
      description: "Number of bombs",
    },
    disabled: {
      control: "boolean",
      description: "Disable the button",
    },
  },
  args: {
    orbs: 5,
    bombs: 3,
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
    bombs: 2,
  },
};

export const Point: Story = {
  args: {
    variant: "point",
    size: "md",
    orbs: 8,
    bombs: 1,
  },
};

export const Multiplier: Story = {
  args: {
    variant: "multiplier",
    size: "md",
    orbs: 4,
    bombs: 3,
  },
};

export const Chip: Story = {
  args: {
    variant: "chip",
    size: "md",
    orbs: 6,
    bombs: 4,
  },
};

export const Moonrock: Story = {
  args: {
    variant: "moonrock",
    size: "md",
    orbs: 2,
    bombs: 5,
  },
};

export const Rainbow: Story = {
  args: {
    variant: "rainbow",
    size: "md",
    orbs: 10,
    bombs: 3,
  },
};

export const NoStats: Story = {
  args: {
    variant: "default",
    size: "md",
    orbs: 0,
    bombs: 0,
  },
};

export const Disabled: Story = {
  args: {
    variant: "default",
    size: "md",
    disabled: true,
  },
};
