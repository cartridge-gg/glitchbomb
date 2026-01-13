import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, type OrbPulled } from "@/models";
import { GameGraph } from "./game-graph";

// Create mock pulls with different orb types
const createMockPulls = (count: number): OrbPulled[] => {
  const orbTypes = [1, 2, 5, 8, 12, 15]; // Point, Point, Health, Multiplier, Special, Bomb
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    pack_id: 1,
    game_id: 1,
    orb: new Orb(orbTypes[i % orbTypes.length]),
  }));
};

const meta = {
  title: "Elements/GameGraph",
  component: GameGraph,
  parameters: {
    layout: "padded",
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-green-950 p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    pulls: createMockPulls(8),
  },
} satisfies Meta<typeof GameGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FewPulls: Story = {
  args: {
    pulls: createMockPulls(3),
  },
};

export const ManyPulls: Story = {
  args: {
    pulls: createMockPulls(15),
  },
};

export const Empty: Story = {
  args: {
    pulls: [],
  },
};

export const SinglePull: Story = {
  args: {
    pulls: createMockPulls(1),
  },
};
