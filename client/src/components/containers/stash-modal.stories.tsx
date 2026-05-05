import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Orb, OrbType } from "@/models";
import { StashModal } from "./stash-modal";

const mockOrbs = [
  new Orb(OrbType.Point5),
  new Orb(OrbType.Point8),
  new Orb(OrbType.Health1),
  new Orb(OrbType.Multiplier50),
  new Orb(OrbType.Moonrock15),
];

const meta = {
  title: "Containers/Stash Modal",
  component: StashModal,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-green-950">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: {
      control: { type: "boolean" },
      description: "Whether the modal is open",
    },
    viewMode: {
      control: { type: "radio" },
      options: ["grid", "list"],
      description: "Layout mode used by the inner stash view",
    },
  },
  args: {
    open: true,
    onOpenChange: fn(),
    orbs: mockOrbs,
    onRemovePending: fn(),
  },
} satisfies Meta<typeof StashModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Empty: Story = {
  args: {
    orbs: [],
  },
};

export const ManyOrbs: Story = {
  args: {
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Point6),
      new Orb(OrbType.Point7),
      new Orb(OrbType.Health1),
      new Orb(OrbType.Health3),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Multiplier100),
      new Orb(OrbType.Moonrock15),
      new Orb(OrbType.Chips15),
    ],
  },
};

export const WithDiscards: Story = {
  args: {
    orbs: mockOrbs,
    discards: [false, true, false, true, false],
  },
};

export const WithPendingOrbs: Story = {
  args: {
    orbs: mockOrbs,
    pendingOrbs: [new Orb(OrbType.Point7), new Orb(OrbType.Multiplier100)],
  },
};

export const ListView: Story = {
  args: {
    viewMode: "list",
    orbs: [
      new Orb(OrbType.Point5),
      new Orb(OrbType.Point8),
      new Orb(OrbType.Moonrock15),
      new Orb(OrbType.Chips15),
      new Orb(OrbType.Multiplier50),
      new Orb(OrbType.Health1),
      new Orb(OrbType.PointBomb4),
    ],
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
