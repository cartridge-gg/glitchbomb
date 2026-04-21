import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Icons from "@/components/icons/regulars";

const meta = {
  title: "Icons/Regulars",
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

const regularIcons = [
  { name: "AlertIcon", component: Icons.AlertIcon },
  { name: "ArrowDownIcon", component: Icons.ArrowDownIcon },
  { name: "ArrowLeftIcon", component: Icons.ArrowLeftIcon },
  { name: "ArrowRightIcon", component: Icons.ArrowRightIcon },
  { name: "BagIcon", component: Icons.BagIcon },
  { name: "BoltIcon", component: Icons.BoltIcon },
  { name: "BookIcon", component: Icons.BookIcon },
  { name: "BracketArrowLeftIcon", component: Icons.BracketArrowLeftIcon },
  { name: "BracketArrowRightIcon", component: Icons.BracketArrowRightIcon },
  { name: "ChartIcon", component: Icons.ChartIcon },
  { name: "ChipIcon", component: Icons.ChipIcon },
  { name: "ControllerIcon", component: Icons.ControllerIcon },
  { name: "CopyIcon", component: Icons.CopyIcon },
  { name: "CreditsIcon", component: Icons.CreditsIcon },
  { name: "CrossIcon", component: Icons.CrossIcon },
  { name: "DiscordIcon", component: Icons.DiscordIcon },
  { name: "DotIcon", component: Icons.DotIcon },
  { name: "EyeIcon", component: Icons.EyeIcon },
  { name: "FireIcon", component: Icons.FireIcon },
  { name: "GearIcon", component: Icons.GearIcon },
  { name: "GiftIcon", component: Icons.GiftIcon },
  { name: "GithubIcon", component: Icons.GithubIcon },
  { name: "GlitchIcon", component: Icons.GlitchIcon },
  { name: "HeartIcon", component: Icons.HeartIcon },
  { name: "HeartOutlineIcon", component: Icons.HeartOutlineIcon },
  { name: "HomeIcon", component: Icons.HomeIcon },
  { name: "LaurelIcon", component: Icons.LaurelIcon },
  { name: "LightbulbIcon", component: Icons.LightbulbIcon },
  { name: "ListIcon", component: Icons.ListIcon },
  { name: "MenuIcon", component: Icons.MenuIcon },
  { name: "MoonrockIcon", component: Icons.MoonrockIcon },
  { name: "MoonrockLargeIcon", component: Icons.MoonrockLargeIcon },
  { name: "QuestIcon", component: Icons.QuestIcon },
  { name: "QuestionmarkIcon", component: Icons.QuestionmarkIcon },
  { name: "ReferralIcon", component: Icons.ReferralIcon },
  { name: "RefreshIcon", component: Icons.RefreshIcon },
  { name: "SparkleIcon", component: Icons.SparkleIcon },
  { name: "SparklesIcon", component: Icons.SparklesIcon },
  { name: "SpeakerIcon", component: Icons.SpeakerIcon },
  { name: "TickIcon", component: Icons.TickIcon },
  { name: "TokenIcon", component: Icons.TokenIcon },
  { name: "TrashIcon", component: Icons.TrashIcon },
  { name: "WarningIcon", component: Icons.WarningIcon },
  { name: "XIcon", component: Icons.XIcon },
] as const;

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-4 text-white">
      {regularIcons.map(({ name, component: Icon }) => (
        <Icon key={name} size="xl" />
      ))}
    </div>
  ),
};
