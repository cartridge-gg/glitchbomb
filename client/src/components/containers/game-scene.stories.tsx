import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { GameScene } from "./game-scene";

const meta: Meta<typeof GameScene> = {
  title: "Containers/GameScene",
  component: GameScene,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    lives: {
      control: "number",
      description: "Number of lives",
    },
    orbs: {
      control: "number",
      description: "Number of orbs",
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

const orbVariants = [
  { variant: "point" as const, content: "+50 pts" },
  { variant: "bomb" as const, content: "-1 HP" },
  { variant: "multiplier" as const, content: "x3" },
  { variant: "chip" as const, content: "+25 Chips" },
  { variant: "moonrock" as const, content: "+50 Moonrocks" },
  { variant: "health" as const, content: "+1 HP" },
];

export const Default: Story = {
  render: (args) => {
    const [orb, setOrb] = useState<
      | {
          variant:
            | "point"
            | "bomb"
            | "multiplier"
            | "chip"
            | "moonrock"
            | "health";
          content: string;
        }
      | undefined
    >(undefined);

    const handlePull = () => {
      // Clear orb first to reset animation
      setOrb(undefined);

      // Pick a random orb variant after a short delay
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
    orbs: 5,
    values: {
      bombs: 20,
      points: 58,
      multipliers: 3,
      chips: 15,
      moonrocks: 8,
      health: 5,
    },
  },
};
