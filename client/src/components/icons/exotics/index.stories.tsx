import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/exotics";

const meta = {
  title: "Icons/Exotics",
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

const exoticIcons = [
  { name: "GlitchBombIcon", component: Icons.GlitchBombIcon },
  { name: "GlitchTokenLargeIcon", component: Icons.GlitchTokenLargeIcon },
  { name: "NumsLogoIcon", component: Icons.NumsLogoIcon },
  { name: "OrbIcon", component: Icons.OrbIcon },
  { name: "OrbBombIcon", component: Icons.OrbBombIcon },
  { name: "OrbChipIcon", component: Icons.OrbChipIcon },
  { name: "OrbHealthIcon", component: Icons.OrbHealthIcon },
  { name: "OrbMoonrockIcon", component: Icons.OrbMoonrockIcon },
  { name: "OrbMultiplierIcon", component: Icons.OrbMultiplierIcon },
  { name: "OrbPointIcon", component: Icons.OrbPointIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-4 text-white">
      {exoticIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};

export const Orbs: Story = {
  render: () => (
    <div className="flex justify-center items-end gap-4 text-white">
      <Icons.OrbPointIcon className="h-[110px] w-[110px] text-green" />
      <Icons.OrbBombIcon className="h-[110px] w-[110px] text-white" />
      <Icons.OrbHealthIcon className="h-[110px] w-[110px] text-salmon" />
      <Icons.OrbMultiplierIcon className="h-[110px] w-[110px] text-yellow" />
      <Icons.OrbChipIcon className="h-[110px] w-[110px] text-orange" />
      <Icons.OrbMoonrockIcon className="h-[110px] w-[110px] text-blue" />
    </div>
  ),
};
