import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, OrbType } from "@/models";
import { SummaryItems } from "./summary-items";

const meta = {
  title: "Containers/Summary Items",
  component: SummaryItems,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default"],
      description: "Visual variant",
    },
  },
} satisfies Meta<typeof SummaryItems>;

export default meta;
type Story = StoryObj<typeof meta>;

const buildOrbs = (entries: Array<[OrbType, number]>): Orb[] =>
  entries.flatMap(([type, count]) =>
    Array.from({ length: count }, () => new Orb(type)),
  );

export const Default: Story = {
  args: {
    variant: "default",
    orbs: buildOrbs([
      [OrbType.Bomb1, 2],
      [OrbType.Point5, 5],
      [OrbType.Multiplier100, 1],
      [OrbType.Health1, 3],
      [OrbType.Moonrock15, 2],
    ]),
  },
};

export const Empty: Story = {
  args: {
    variant: "default",
    orbs: [],
  },
};

export const OnlyPoints: Story = {
  args: {
    variant: "default",
    orbs: buildOrbs([[OrbType.Point7, 8]]),
  },
};

export const Mixed: Story = {
  args: {
    variant: "default",
    orbs: buildOrbs([
      [OrbType.Bomb1, 1],
      [OrbType.Bomb2, 1],
      [OrbType.Point5, 2],
      [OrbType.Point8, 1],
      [OrbType.Multiplier50, 2],
      [OrbType.Health2, 1],
      [OrbType.Chips15, 1],
      [OrbType.Moonrock40, 1],
    ]),
  },
};
