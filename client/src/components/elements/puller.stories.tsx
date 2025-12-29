import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { Puller } from "./puller";

const meta = {
  title: "Elements/Puller",
  component: Puller,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "Visual variant of the puller",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "Size of the puller component",
    },
    disabled: {
      control: "boolean",
      description: "Disable the button",
    },
  },
  args: {
    orbs: 5,
    lives: 5,
    onClick: fn(),
  },
} satisfies Meta<typeof Puller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "md",
  },
};

export const Disabled: Story = {
  args: {
    variant: "default",
    size: "md",
    disabled: true,
  },
};
