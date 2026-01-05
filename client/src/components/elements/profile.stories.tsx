import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Profile } from "./profile";

const meta = {
  title: "Elements/Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    username: "John Doe",
    highlight: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
