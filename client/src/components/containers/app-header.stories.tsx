import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { AppHeader } from "./app-header";

const meta = {
  title: "Containers/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    moonrocks: {
      control: { type: "number" },
      description: "Token balance (moonrocks)",
    },
    username: {
      control: { type: "text" },
      description: "Player username",
    },
    showBack: {
      control: { type: "boolean" },
      description: "Show back button",
    },
    backPath: {
      control: { type: "text" },
      description: "Path to navigate back to",
    },
  },
  args: {
    moonrocks: 1500,
    username: "Player1",
    showBack: true,
    backPath: "/",
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithoutBackButton: Story = {
  args: {
    showBack: false,
  },
};

export const WithoutUsername: Story = {
  args: {
    username: undefined,
  },
};

export const HighBalance: Story = {
  args: {
    moonrocks: 999999,
  },
};
