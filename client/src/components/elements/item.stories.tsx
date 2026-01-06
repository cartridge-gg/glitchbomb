import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
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
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
    onAdd: { action: "added" },
    onClick: { action: "clicked" },
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
    onAdd: fn(),
  },
};

export const Bomb: Story = {
  args: {
    title: "Bomb Orb",
    description: "Explosive power in a compact package",
    cost: 15,
    variant: "bomb",
    onAdd: fn(),
  },
};

export const Point: Story = {
  args: {
    title: "Point Orb",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    cost: 15,
    variant: "point",
    onAdd: fn(),
  },
};

export const Multiplier: Story = {
  args: {
    title: "Multi Orb",
    description: "Multiply your score and dominate",
    cost: 15,
    variant: "multiplier",
    onAdd: fn(),
  },
};

export const Chip: Story = {
  args: {
    title: "Chip Orb",
    description: "Collect chips for special rewards",
    cost: 15,
    variant: "chip",
    onAdd: fn(),
  },
};

export const Moonrock: Story = {
  args: {
    title: "Moonrock Orb",
    description: "Rare and powerful moonrock essence",
    cost: 15,
    variant: "moonrock",
    onAdd: fn(),
  },
};

export const Health: Story = {
  args: {
    title: "Health Orb",
    description: "Restore your vitality with this orb",
    cost: 15,
    variant: "health",
    onAdd: fn(),
  },
};

export const Selected: Story = {
  args: {
    title: "Point Orb",
    description: "This orb is currently selected (80% opacity)",
    cost: 15,
    variant: "point",
    selected: true,
    onAdd: fn(),
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    title: "Bomb Orb",
    description: "Not enough chips to purchase this orb",
    cost: 15,
    variant: "bomb",
    disabled: true,
    onAdd: fn(),
  },
};

export const AllStates: Story = {
  args: {
    title: "Normal Item",
    description: "Click + to add",
    cost: 15,
    variant: "point",
    onAdd: fn(),
  },
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      <Item
        title="Normal Item"
        description="Click + to add"
        cost={15}
        variant="point"
        onAdd={fn()}
      />
      <Item
        title="In Basket (Selected)"
        description="Click anywhere to remove (80% opacity)"
        cost={15}
        variant="multiplier"
        selected={true}
        onAdd={fn()}
        onClick={fn()}
      />
      <Item
        title="Cannot Afford (Disabled)"
        description="Not enough chips to purchase (40% opacity)"
        cost={999}
        variant="bomb"
        disabled={true}
        onAdd={fn()}
      />
    </div>
  ),
};
