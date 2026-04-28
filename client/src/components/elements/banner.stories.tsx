import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";
import { Banner } from "./banner";
import { glitchBombConfig, lootSurvivorConfig } from "./banner.fixtures";

const meta = {
  title: "Elements/Banner",
  component: Banner,
  parameters: {
    layout: "padded",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md"],
      description: "The size variant",
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  args: {},
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Social: Story = {
  args: {
    preset: "social",
    name: "social",
    config: glitchBombConfig,
    onClick: fn(),
  },
};

export const Claimed: Story = {
  args: {
    preset: "social",
    name: "social",
    config: glitchBombConfig,
    disabled: true,
  },
};

export const LootSurvivor: Story = {
  args: {
    preset: "loot-survivor",
    name: "loot-survivor",
    config: lootSurvivorConfig,
    position: 64,
    onClick: fn(),
  },
};
