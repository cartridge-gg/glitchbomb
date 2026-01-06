import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./tag";

const meta = {
  title: "Elements/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
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
        "health",
      ],
    },
    count: { control: "number" },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 5,
    variant: "default",
  },
};

export const Bomb: Story = {
  args: {
    count: 3,
    variant: "bomb",
  },
};

export const Point: Story = {
  args: {
    count: 10,
    variant: "point",
  },
};

export const Multiplier: Story = {
  args: {
    count: 2,
    variant: "multiplier",
  },
};

export const Chip: Story = {
  args: {
    count: 15,
    variant: "chip",
  },
};

export const Moonrock: Story = {
  args: {
    count: 7,
    variant: "moonrock",
  },
};

export const Health: Story = {
  args: {
    count: 4,
    variant: "health",
  },
};

export const LargeCount: Story = {
  args: {
    count: 999,
    variant: "point",
  },
};
