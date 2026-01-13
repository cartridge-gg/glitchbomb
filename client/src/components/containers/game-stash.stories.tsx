import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { Orb } from "@/models";
import { GameStash } from "./game-stash";

// Create mock orbs
const mockOrbs = [
  new Orb(1), // Point5
  new Orb(2), // Point8
  new Orb(5), // Health1
  new Orb(8), // Multiplier1
  new Orb(12), // Special1
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
  argTypes: {
    chips: {
      control: { type: "number" },
      description: "Current chips balance",
    },
  },
  args: {
    orbs: mockOrbs,
    chips: 45,
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
  },
};

export const ManyOrbs: Story = {
  args: {
    orbs: [
      new Orb(1),
      new Orb(2),
      new Orb(3),
      new Orb(5),
      new Orb(6),
      new Orb(8),
      new Orb(9),
      new Orb(12),
      new Orb(13),
    ],
  },
};
