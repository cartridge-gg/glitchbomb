import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/states";

const meta = {
  title: "Icons/States",
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

const stateIcons = [
  { name: "GlitchStateIcon", component: Icons.GlitchStateIcon },
  { name: "GridIcon", component: Icons.GridIcon },
  { name: "ListStateIcon", component: Icons.ListStateIcon },
  { name: "SoundIcon", component: Icons.SoundIcon },
  { name: "TrophyIcon", component: Icons.TrophyIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-wrap gap-4">
        {stateIcons.map(({ name, component: Icon }) => (
          <Icon key={`${name}-solid`} size="xl" variant="solid" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {stateIcons.map(({ name, component: Icon }) => (
          <Icon key={`${name}-line`} size="xl" variant="line" />
        ))}
      </div>
    </div>
  ),
};
