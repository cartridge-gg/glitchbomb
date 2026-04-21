import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/bombs";
import { cn } from "@/lib/utils";

const meta = {
  title: "Icons/Bombs",
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

const bombIcons = [
  { name: "BombIcon", component: Icons.BombIcon },
  { name: "Bomb1xIcon", component: Icons.Bomb1xIcon },
  { name: "Bomb2xIcon", component: Icons.Bomb2xIcon },
  { name: "Bomb3xIcon", component: Icons.Bomb3xIcon },
  { name: "BombOrbIcon", component: Icons.BombOrbIcon },
  { name: "StickyBombIcon", component: Icons.StickyBombIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(6,minmax(0,1fr))] gap-4 text-white">
      {bombIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};

export const BombVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-green">
        {sizes.map((size, index) => (
          <Icons.BombIcon
            key={size}
            size={size}
            className={cn(index % 2 === 0 ? "opacity-100" : "opacity-20")}
          />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4 text-orange">
        {sizes.map((size, index) => (
          <Icons.BombIcon
            key={size}
            size={size}
            className={cn(index % 2 === 1 ? "opacity-100" : "opacity-20")}
            variant="double"
          />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size, index) => (
          <Icons.BombIcon
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
