import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Elements/Progress Bar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[200px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    count: {
      control: "number",
      description: "Current progress count",
    },
    total: {
      control: "number",
      description: "Total required for completion",
    },
    variant: {
      control: "select",
      options: ["default", "complete"],
      description: "Visual variant",
    },
    className: {
      control: "text",
      description: "Class applied to the outer track",
    },
    barClassName: {
      control: "text",
      description: "Class applied to the inner fill",
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    total: 10,
    variant: "default",
  },
};

export const Complete: Story = {
  args: {
    count: 10,
    total: 10,
    variant: "complete",
  },
};

export const Empty: Story = {
  args: {
    count: 0,
    total: 10,
    variant: "default",
  },
};

export const CustomTrack: Story = {
  args: {
    count: 5,
    total: 10,
    className: "bg-salmon-100",
  },
};

export const CustomFill: Story = {
  args: {
    count: 5,
    total: 10,
    barClassName: "bg-green-100",
  },
};
