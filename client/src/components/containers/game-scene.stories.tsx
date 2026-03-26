import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { GameScene, type OrbOutcome } from "./game-scene";

const meta: Meta<typeof GameScene> = {
  title: "Containers/GameScene",
  component: GameScene,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    lives: {
      control: "number",
      description: "Number of lives",
    },
    bombs: {
      control: "number",
      description: "Number of bombs in the bag",
    },
    orbs: {
      control: "number",
      description: "Number of orbs",
    },
    multiplier: {
      control: "number",
      description: "Current multiplier value",
    },
    values: {
      control: "object",
      description:
        "Object with bombs, points, multipliers, chips, and moonrocks values",
    },
    orb: {
      control: "object",
      description: "Object with variant and content",
    },
    variant: {
      control: { type: "select" },
      options: ["default"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof GameScene>;

const orbVariants: OrbOutcome[] = [
  { variant: "point", content: "+5 pts", basePoints: 5 },
  { variant: "bomb", content: "-1 HP" },
  { variant: "multiplier", content: "x3" },
  { variant: "chip", content: "+25 Chips" },
  { variant: "moonrock", content: "+50 Moonrocks" },
  { variant: "health", content: "+1 HP" },
];

const multipliedPointOrb: OrbOutcome = {
  variant: "point",
  content: "+5 pts",
  basePoints: 5,
  multipliedPoints: 7,
  activeMultiplier: 1.5,
};

export const Default: Story = {
  render: (args) => {
    const [orb, setOrb] = useState<OrbOutcome | undefined>(undefined);

    const handlePull = () => {
      setOrb(undefined);
      setTimeout(() => {
        const randomOrb =
          orbVariants[Math.floor(Math.random() * orbVariants.length)];
        setOrb(randomOrb);
      }, 100);
    };

    return <GameScene {...args} orb={orb} onPull={handlePull} />;
  },
  args: {
    lives: 5,
    bombs: 3,
    orbs: 5,
    multiplier: 3,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};

export const MultiplierEffect: Story = {
  render: (args) => {
    const [orb, setOrb] = useState<OrbOutcome | undefined>(undefined);

    const handlePull = () => {
      setOrb(undefined);
      setTimeout(() => {
        setOrb(multipliedPointOrb);
      }, 100);
    };

    return <GameScene {...args} orb={orb} onPull={handlePull} />;
  },
  args: {
    lives: 5,
    bombs: 3,
    orbs: 5,
    multiplier: 1.5,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      special: 23,
      health: 5,
    },
  },
};
