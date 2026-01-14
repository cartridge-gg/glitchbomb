import type { Meta, StoryObj } from "@storybook/react-vite";
import { GraphPoint } from "./graphpoint";

const meta = {
  title: "Elements/GraphPoint",
  component: GraphPoint,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    icon: {
      control: "select",
      options: ["point", "bomb", "health", "multiplier", "chip", "moonrock"],
      description: "Orb icon type (determines circle background color)",
    },
  },
  args: {
    icon: "point",
  },
} satisfies Meta<typeof GraphPoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div className="flex gap-3 bg-gray-900 p-8">
      <GraphPoint icon="point" />
      <GraphPoint icon="bomb" />
      <GraphPoint icon="health" />
      <GraphPoint icon="multiplier" />
      <GraphPoint icon="chip" />
      <GraphPoint icon="moonrock" />
    </div>
  ),
};
