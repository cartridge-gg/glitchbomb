import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb } from "@/models";
import { OrbDisplay } from "./orb-display";

const meta = {
  title: "Elements/Orb Display",
  component: OrbDisplay,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the orb display",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-green-950">
        <Story />
      </div>
    ),
  ],
  args: {
    orb: Orb.from(1),
  },
} satisfies Meta<typeof OrbDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Point5: Story = {
  args: {
    orb: Orb.from(1), // Point5
    size: "lg",
  },
};

export const Point8: Story = {
  args: {
    orb: Orb.from(2), // Point8
    size: "lg",
  },
};

export const Health: Story = {
  args: {
    orb: Orb.from(5), // Health1
    size: "lg",
  },
};

export const Multiplier: Story = {
  args: {
    orb: Orb.from(8), // Multiplier1
    size: "lg",
  },
};

export const Special: Story = {
  args: {
    orb: Orb.from(12), // Special1
    size: "lg",
  },
};

export const SmallSize: Story = {
  args: {
    orb: Orb.from(1),
    size: "sm",
  },
};

export const MediumSize: Story = {
  args: {
    orb: Orb.from(1),
    size: "md",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <OrbDisplay orb={Orb.from(1)} size="sm" />
      <OrbDisplay orb={Orb.from(2)} size="md" />
      <OrbDisplay orb={Orb.from(5)} size="lg" />
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <OrbDisplay orb={Orb.from(1)} size="lg" />
      <OrbDisplay orb={Orb.from(5)} size="lg" />
      <OrbDisplay orb={Orb.from(8)} size="lg" />
      <OrbDisplay orb={Orb.from(12)} size="lg" />
    </div>
  ),
};
