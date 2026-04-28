import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChipIcon, MoonrockIcon } from "@/components/icons";
import { InfoCard } from "./info-card";

const meta = {
  title: "Elements/Info Card",
  component: InfoCard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] h-[220px] bg-green-950 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["green", "red", "yellow", "orange"],
    },
    isLoading: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    hideInner: {
      control: { type: "boolean" },
    },
  },
  args: {
    variant: "yellow",
    label: "Cash Out",
    isLoading: false,
    disabled: false,
    hideInner: false,
    onClick: () => console.log("Clicked"),
  },
} satisfies Meta<typeof InfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2">
        <MoonrockIcon className="w-6 h-6 text-yellow-400" />
        <span className="text-yellow-400 font-secondary text-lg">150</span>
      </div>
    ),
  },
};

export const LoadingYellow: Story = {
  args: {
    variant: "yellow",
    label: "Cash Out",
    isLoading: true,
    children: (
      <div className="flex items-center gap-2">
        <MoonrockIcon className="w-6 h-6 text-yellow-400" />
        <span className="text-yellow-400 font-secondary text-lg">150</span>
      </div>
    ),
  },
};

export const LoadingOrange: Story = {
  args: {
    variant: "orange",
    label: "Continue",
    isLoading: true,
    children: (
      <div className="flex items-center gap-2">
        <ChipIcon size="md" className="text-orange-400" />
        <span className="text-orange-400 font-secondary text-lg">+50</span>
      </div>
    ),
  },
};

export const LoadingGreen: Story = {
  args: {
    variant: "green",
    label: "Reward",
    isLoading: true,
    children: <span className="text-green-400 font-secondary">Content</span>,
  },
};

export const LoadingRed: Story = {
  args: {
    variant: "red",
    label: "Danger",
    isLoading: true,
    children: <span className="text-red-100 font-secondary">Content</span>,
  },
};
