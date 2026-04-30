import type { Meta, StoryObj } from "@storybook/react-vite";
import { BombSlot } from "./bomb-slot";

const meta = {
  title: "Elements/Bomb Slot",
  component: BombSlot,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 3, step: 1 },
      description:
        "Bomb value: 1, 2 or 3 renders the matching bomb icon; any other value renders an empty slot",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant",
    },
    active: {
      control: "boolean",
      description:
        "Whether the bomb is still live (drives data-active styling)",
    },
  },
  args: {
    value: 1,
    variant: "default",
    active: true,
  },
} satisfies Meta<typeof BombSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Values: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <BombSlot {...args} value={0} />
      <BombSlot {...args} value={1} />
      <BombSlot {...args} value={2} />
      <BombSlot {...args} value={3} />
    </div>
  ),
};

export const ActiveVsUsed: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <BombSlot {...args} value={1} active />
        <BombSlot {...args} value={2} active />
        <BombSlot {...args} value={3} active />
      </div>
      <div className="flex items-center gap-4">
        <BombSlot {...args} value={1} active={false} />
        <BombSlot {...args} value={2} active={false} />
        <BombSlot {...args} value={3} active={false} />
      </div>
    </div>
  ),
};
