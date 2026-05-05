import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { GameStash } from "./game-stash";

// Create mock orbs
const mockOrbs = [
  new Orb(OrbType.Point5),
  new Orb(OrbType.Point8),
  new Orb(OrbType.Health1),
  new Orb(OrbType.Multiplier50),
  new Orb(OrbType.Moonrock15),
];

const meta = {
  title: "Containers/Game Stash",
  component: GameStash,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {
    orbs: mockOrbs,
  },
} satisfies Meta<typeof GameStash>;

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
