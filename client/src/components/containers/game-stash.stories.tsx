import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { Orb, OrbPulled, OrbType } from "@/models";
import { GameStash } from "./game-stash";

// Create mock orbs
const mockOrbs = [
  new Orb(OrbType.Point5),
  new Orb(OrbType.Point8),
  new Orb(OrbType.Health1),
  new Orb(OrbType.Multiplier50),
  new Orb(OrbType.Moonrock15),
];

// Create mock pulls
const mockPulls = [
  new OrbPulled(1, 1, 1, new Orb(OrbType.Point5), 95),
  new OrbPulled(1, 1, 2, new Orb(OrbType.Bomb1), 95),
  new OrbPulled(1, 1, 3, new Orb(OrbType.Point8), 103),
  new OrbPulled(1, 1, 4, new Orb(OrbType.Multiplier50), 154),
  new OrbPulled(1, 1, 5, new Orb(OrbType.Health1), 154),
];

const meta = {
  title: "Containers/GameStash",
  component: GameStash,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="h-screen bg-green-950">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {},
  args: {
    orbs: mockOrbs,
    pulls: mockPulls,
    onClose: () => console.log("Closed stash"),
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
    pulls: [],
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

export const ManyLogs: Story = {
  args: {
    pulls: [
      new OrbPulled(1, 1, 1, new Orb(OrbType.Point5), 95),
      new OrbPulled(1, 1, 2, new Orb(OrbType.Bomb1), 95),
      new OrbPulled(1, 1, 3, new Orb(OrbType.Point8), 103),
      new OrbPulled(1, 1, 4, new Orb(OrbType.Multiplier50), 154),
      new OrbPulled(1, 1, 5, new Orb(OrbType.Health1), 154),
      new OrbPulled(1, 1, 6, new Orb(OrbType.Bomb2), 154),
      new OrbPulled(1, 1, 7, new Orb(OrbType.Point9), 163),
      new OrbPulled(1, 1, 8, new Orb(OrbType.Moonrock15), 178),
      new OrbPulled(1, 1, 9, new Orb(OrbType.Chips15), 178),
      new OrbPulled(1, 1, 10, new Orb(OrbType.PointBomb4), 186),
    ],
  },
};
