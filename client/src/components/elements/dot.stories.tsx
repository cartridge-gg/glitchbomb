import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dot } from "./dot";

const meta = {
  title: "Elements/Dot",
  component: Dot,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    variant: {
      control: "select",
      options: ["default"],
      description: "Component variant",
    },
    size: {
      control: "select",
      options: ["md"],
      description: "Component size",
    },
  },
  args: {
    size: "md",
    variant: "default",
  },
} satisfies Meta<typeof Dot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Dot variant="green" />
      <Dot variant="yellow" />
      <Dot variant="orange" />
      <Dot variant="red" />
      <Dot variant="blue" />
      <Dot variant="salmon" />
    </div>
  ),
};
