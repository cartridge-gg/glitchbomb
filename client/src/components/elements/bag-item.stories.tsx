import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Orb, OrbType } from "@/models";
import { BagItem } from "./bag-item";

const meta = {
  title: "Elements/Bag Item",
  component: BagItem,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0}>
        <Story />
      </TooltipProvider>
    ),
  ],
  argTypes: {
    discarded: {
      control: { type: "boolean" },
      description: "Whether the orb has been discarded",
    },
  },
  args: {
    orb: new Orb(OrbType.Point5),
    discarded: false,
  },
} satisfies Meta<typeof BagItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Discarded: Story = {
  args: {
    discarded: true,
  },
};

export const Bomb: Story = {
  args: {
    orb: new Orb(OrbType.Bomb1),
  },
};

export const Multiplier: Story = {
  args: {
    orb: new Orb(OrbType.Multiplier50),
  },
};

export const Health: Story = {
  args: {
    orb: new Orb(OrbType.Health1),
  },
};

export const Moonrock: Story = {
  args: {
    orb: new Orb(OrbType.Moonrock15),
  },
};
