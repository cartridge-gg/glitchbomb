import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons";
import { cn } from "@/lib/utils";

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

export const Default: Story = {
  render: () => (
    <div className="flex justify-center items-end gap-4 text-white">
      <Icons.ArrowDownIcon size="md" />
      <Icons.BombOrbIcon size="md" />
      <Icons.BombIcon size="md" />
      <Icons.ChipIcon size="md" />
      <Icons.ControllerIcon size="md" />
      <Icons.CrossIcon size="md" />
      <Icons.DotIcon size="md" />
      <Icons.HeartIcon size="md" />
      <Icons.ListIcon size="md" />
      <Icons.MoonrockIcon size="md" />
      <Icons.OrbIcon size="md" />
      <Icons.SparklesIcon size="md" />
      <Icons.TokenIcon size="md" />
      <Icons.WarningIcon size="md" />
    </div>
  ),
};

export const Orbs: Story = {
  render: () => (
    <div className="flex justify-center items-end gap-4 text-white">
      <Icons.OrbPointIcon className="h-[110px] w-[110px] text-green-400" />
      <Icons.OrbBombIcon className="h-[110px] w-[110px] text-red-100" />
      <Icons.OrbHealthIcon className="h-[110px] w-[110px] text-salmon-100" />
      <Icons.OrbMultiplierIcon className="h-[110px] w-[110px] text-yellow-100" />
      <Icons.OrbChipIcon className="h-[110px] w-[110px] text-orange-100" />
      <Icons.OrbMoonrockIcon className="h-[110px] w-[110px] text-blue-100" />
    </div>
  ),
};

export const ArrowDown: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.ArrowDownIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const BombOrb: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.BombOrbIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Chip: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.ChipIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Cross: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.CrossIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Dot: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.DotIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const GlitchBomb: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.HeartIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Heart: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.HeartIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.ListIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Moonrock: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.MoonrockIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Orb: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.OrbIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Sparkles: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.SparklesIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.WarningIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Bomb: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-green-400">
        {sizes.map((size, index) => (
          <Icons.BombIcon
            key={size}
            size={size}
            className={cn(index % 2 === 0 ? "opacity-100" : "opacity-20")}
          />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4 text-orange-100">
        {sizes.map((size, index) => (
          <Icons.BombIcon
            key={size}
            size={size}
            className={cn(index % 2 === 1 ? "opacity-100" : "opacity-20")}
            variant="double"
          />
        ))}
      </div>
      <div className="flex justify-center items-end gap-4 text-red-100">
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

export const Controller: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.ControllerIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};

export const Token: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center items-end gap-4 text-white">
        {sizes.map((size) => (
          <Icons.TokenIcon key={size} size={size} />
        ))}
      </div>
    </div>
  ),
};
