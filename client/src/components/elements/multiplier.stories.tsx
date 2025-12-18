import type { Meta, StoryObj } from "@storybook/react-vite";
import { Multiplier } from "./multiplier";

const meta = {
	title: "Elements/Multiplier",
	component: Multiplier,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		color: {
			control: "select",
			options: ["green", "orange", "red"],
		},
		count: {
			control: { type: "number", min: 1, max: 10 },
		},
		size: {
			control: "select",
			options: ["md"],
		},
	},
} satisfies Meta<typeof Multiplier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		count: 3,
		size: "md",
		color: "green",
	},
};
