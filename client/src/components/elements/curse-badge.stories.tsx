import type { Meta, StoryObj } from "@storybook/react-vite";
import { CurseBadge } from "./curse-badge";

const meta = {
  title: "Elements/CurseBadge",
  component: CurseBadge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: { type: "range", min: 24, max: 120, step: 4 },
      description: "Badge size in pixels",
    },
  },
} satisfies Meta<typeof CurseBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 64,
  },
};

export const Small: Story = {
  args: {
    size: 36,
  },
};

export const Large: Story = {
  args: {
    size: 96,
  },
};
