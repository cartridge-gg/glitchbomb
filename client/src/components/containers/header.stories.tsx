import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrowserRouter } from "react-router-dom";
import { fn } from "storybook/test";
import { Header } from "./header";

const meta = {
  title: "Containers/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
  },
  globals: {
    backgrounds: {
      value: "purple",
    },
  },
  argTypes: {
    tokenBalance: {
      control: "number",
      description: "The balance value to display",
    },
    variant: {
      control: "select",
      options: ["default"],
      description: "The visual variant",
    },
    onBalance: {
      table: {
        disable: true,
      },
    },
    onConnect: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    tokenBalance: 100200,
    onBalance: fn(),
    onConnect: undefined,
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Visitor: Story = {
  args: {
    onConnect: fn(),
  },
};
