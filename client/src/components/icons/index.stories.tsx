import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@/lib/utils";
import { BombIcon } from "./bomb";

const meta = {
	title: "Assets/Icons",
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

export const Bomb: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<div className="flex justify-center items-end gap-4 text-green-100">
				{sizes.map((size, index) => (
					<BombIcon
						key={size}
						size={size}
						className={cn(index % 2 === 0 ? "opacity-100" : "opacity-20")}
					/>
				))}
			</div>
			<div className="flex justify-center items-end gap-4 text-orange-100">
				{sizes.map((size, index) => (
					<BombIcon
						key={size}
						size={size}
						className={cn(index % 2 === 1 ? "opacity-100" : "opacity-20")}
						variant="double"
					/>
				))}
			</div>
			<div className="flex justify-center items-end gap-4 text-red-100">
				{sizes.map((size, index) => (
					<BombIcon
						key={size}
						size={size}
						className={cn(index % 2 === 0 ? "opacity-100" : "opacity-20")}
						variant="triple"
					/>
				))}
			</div>
		</div>
	),
};
