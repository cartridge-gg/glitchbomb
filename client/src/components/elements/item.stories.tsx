import type { Meta, StoryObj } from "@storybook/react-vite";
import { Item } from "./item";

const meta = {
  title: "Elements/Item",
  component: Item,
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
    title: { control: "text" },
    description: { control: "text" },
    cost: { control: "number" },
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Mystery Orb",
    description: "A mysterious orb with unknown powers",
    cost: 15,
    variant: "default",
  },
};

export const Bomb: Story = {
  args: {
    title: "Bomb Orb",
    description: "Explosive power in a compact package",
    cost: 15,
    variant: "bomb",
  },
};

export const Point: Story = {
  args: {
    title: "Point Orb",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    cost: 15,
    variant: "point",
  },
};

export const Multiplier: Story = {
  args: {
    title: "Multi Orb",
    description: "Multiply your score and dominate",
    cost: 15,
    variant: "multiplier",
  },
};

export const Chip: Story = {
  args: {
    title: "Chip Orb",
    description: "Collect chips for special rewards",
    cost: 15,
    variant: "chip",
  },
};

export const Moonrock: Story = {
  args: {
    title: "Moonrock Orb",
    description: "Rare and powerful moonrock essence",
    cost: 15,
    variant: "moonrock",
  },
};

export const Health: Story = {
  args: {
    title: "Health Orb",
    description: "Restore your vitality with this orb",
    cost: 15,
    variant: "health",
  },
};
