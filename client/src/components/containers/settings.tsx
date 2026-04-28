import { cva, type VariantProps } from "class-variance-authority";
import { useId } from "react";
import { Close, NotificationPing } from "@/components/elements";
import { Sound } from "@/components/elements/sound";
import {
  BookIcon,
  DiscordIcon,
  GithubIcon,
  LaurelIcon,
  LightbulbIcon,
  QuestIcon,
  ReferralIcon,
  ShadowEffect,
  TrophyIcon,
  XIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { GlitchText } from "../ui/glitch-text";

export interface SettingsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof settingsVariants> {
  onClose: () => void;
  musicVolume: number;
  musicMuted: boolean;
  onMusicChange: (value: number) => void;
  onMusicMute: () => void;
  sfxVolume: number;
  sfxMuted: boolean;
  onSfxChange: (value: number) => void;
  onSfxMute: () => void;
  onLeaderboard: () => void;
  onReferrals: () => void;
  onAchievements: () => void;
  onQuests: () => void;
  onTutorial: () => void;
  onLogOut: () => void;
  onConnect: () => void;
  hasReferralNotification?: boolean;
  username?: string;
  onProfile?: () => void;
}

const settingsVariants = cva("select-none relative flex flex-col gap-6", {
  variants: {
    variant: {
      default:
        "rounded-lg bg-black-100 p-6 outline outline-4 -outline-offset-4 outline-green-600 md:p-8",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const Settings = ({
  onClose,
  musicVolume,
  musicMuted,
  onMusicChange,
  onMusicMute,
  sfxVolume,
  sfxMuted,
  onSfxChange,
  onSfxMute,
  onLeaderboard,
  onReferrals,
  onAchievements,
  onQuests,
  onTutorial,
  onLogOut,
  onConnect,
  hasReferralNotification,
  username,
  onProfile,
  variant,
  className,
  ...props
}: SettingsProps) => {
  const filterId = useId();

  return (
    <div className={cn(settingsVariants({ variant, className }))} {...props}>
      <ShadowEffect filterId={filterId} />

      {/* Mobile header */}
      <div className="flex items-center justify-between md:hidden">
        <h2 className="text-2xl/8 text-primary-100 uppercase">
          <GlitchText
            text="Settings"
            style={{
              textShadow:
                "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
            }}
          />
        </h2>
        <Close size="md" onClick={onClose} />
      </div>

      {/* Desktop header */}
      {onClose ? (
        <Close
          size="md"
          onClick={onClose}
          className="absolute top-4 right-4 hidden md:block"
        />
      ) : null}
      <h2 className="text-[2.5rem] text-primary-100 uppercase hidden md:block">
        <GlitchText
          text="Settings"
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>

      {/* Mobile content */}
      <div className="flex flex-col gap-6 h-full overflow-hidden md:hidden">
        <Volumes
          musicVolume={musicVolume}
          musicMuted={musicMuted}
          onMusicChange={onMusicChange}
          onMusicMute={onMusicMute}
          sfxVolume={sfxVolume}
          sfxMuted={sfxMuted}
          onSfxChange={onSfxChange}
          onSfxMute={onSfxMute}
        />
        <div className="flex flex-col gap-6 flex-1 justify-between overflow-hidden">
          <div
            className="flex flex-col gap-4 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <NavButtons
              filterId={filterId}
              onReferrals={onReferrals}
              onAchievements={onAchievements}
              onQuests={onQuests}
              onLeaderboard={onLeaderboard}
              onTutorial={onTutorial}
              connected={!!username}
              hasReferralNotification={hasReferralNotification}
            />
            {username && onProfile ? (
              <>
                <ProfileButton username={username} onProfile={onProfile} />
                <LogOutButton onLogOut={onLogOut} />
              </>
            ) : (
              <LogInButton onConnect={onConnect} />
            )}
          </div>
          <Socials />
        </div>
      </div>

      {/* Desktop content */}
      <div className="hidden md:flex gap-8 flex-1">
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <NavButtons
            filterId={filterId}
            onReferrals={onReferrals}
            onAchievements={onAchievements}
            onQuests={onQuests}
            onLeaderboard={onLeaderboard}
            onTutorial={onTutorial}
            connected={!!username}
            hasReferralNotification={hasReferralNotification}
          />
        </div>
        <div className="flex flex-col justify-between gap-4 flex-1 min-w-0">
          <Volumes
            musicVolume={musicVolume}
            musicMuted={musicMuted}
            onMusicChange={onMusicChange}
            onMusicMute={onMusicMute}
            sfxVolume={sfxVolume}
            sfxMuted={sfxMuted}
            onSfxChange={onSfxChange}
            onSfxMute={onSfxMute}
          />
          <div className="flex flex-col gap-4">
            {username && onProfile ? (
              <div className="flex gap-4">
                <ProfileButton username={username} onProfile={onProfile} />
                <LogOutButton onLogOut={onLogOut} />
              </div>
            ) : (
              <LogInButton onConnect={onConnect} />
            )}
            <Socials />
          </div>
        </div>
      </div>
    </div>
  );
};

const Volumes = ({
  musicVolume,
  musicMuted,
  onMusicChange,
  onMusicMute,
  sfxVolume,
  sfxMuted,
  onSfxChange,
  onSfxMute,
}: {
  musicVolume: number;
  musicMuted: boolean;
  onMusicChange: (value: number) => void;
  onMusicMute: () => void;
  sfxVolume: number;
  sfxMuted: boolean;
  onSfxChange: (value: number) => void;
  onSfxMute: () => void;
}) => (
  <div className="flex flex-col gap-6">
    <Sound
      title="Music Volume"
      value={musicVolume}
      muted={musicMuted}
      onChange={onMusicChange}
      onMute={onMusicMute}
    />
    <Sound
      title="SFX Volume"
      value={sfxVolume}
      muted={sfxMuted}
      onChange={onSfxChange}
      onMute={onSfxMute}
    />
  </div>
);

const NavButtons = ({
  filterId,
  onLeaderboard,
  onQuests,
  onAchievements,
  onReferrals,
  onTutorial,
  connected,
  hasReferralNotification,
}: {
  filterId: string;
  onLeaderboard: () => void;
  onQuests: () => void;
  onAchievements: () => void;
  onReferrals: () => void;
  onTutorial: () => void;
  connected: boolean;
  hasReferralNotification?: boolean;
}) => (
  <>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onLeaderboard}
    >
      <TrophyIcon
        variant="solid"
        size="sm"
        style={{ filter: `url(#${filterId})` }}
      />
      <span className="px-1 font-secondary font-[22px]/3 uppercase">
        Leaderboard
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onQuests}
    >
      <QuestIcon size="sm" style={{ filter: `url(#${filterId})` }} />
      <span className="px-1 font-secondary font-[22px]/3 uppercase">
        Quests
      </span>
    </Button>
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onAchievements}
    >
      <LaurelIcon size="sm" style={{ filter: `url(#${filterId})` }} />
      <span className="px-1 font-secondary font-[22px]/3 uppercase">
        Achievements
      </span>
    </Button>
    {connected && (
      <Button
        variant="secondary"
        className="relative h-10 min-h-10 gap-1"
        onClick={onReferrals}
      >
        <ReferralIcon size="sm" style={{ filter: `url(#${filterId})` }} />
        <span className="px-1 font-secondary font-[22px]/3 uppercase">
          Referrals
        </span>
        {hasReferralNotification && <NotificationPing />}
      </Button>
    )}
    <Button
      variant="secondary"
      className="h-10 min-h-10 gap-1"
      onClick={onTutorial}
    >
      <LightbulbIcon size="sm" style={{ filter: `url(#${filterId})` }} />
      <span className="px-1 font-secondary font-[22px]/3 uppercase">
        Tutorial
      </span>
    </Button>
  </>
);

const ProfileButton = ({
  username,
  onProfile,
}: {
  username: string;
  onProfile: () => void;
}) => (
  <Button
    variant="constructive"
    className="h-10 min-h-10 flex-1 min-w-0"
    onClick={onProfile}
  >
    <span className="px-1 font-secondary font-[22px]/3 uppercase truncate">
      {username}
    </span>
  </Button>
);

const LogInButton = ({ onConnect }: { onConnect: () => void }) => (
  <Button variant="constructive" className="h-10 min-h-10" onClick={onConnect}>
    <span className="px-1 font-secondary font-[22px]/3 uppercase">Log In</span>
  </Button>
);

const LogOutButton = ({ onLogOut }: { onLogOut: () => void }) => (
  <Button
    variant="destructive"
    className="h-10 min-h-10 flex-1 min-w-0"
    onClick={onLogOut}
  >
    <span className="px-1 font-secondary font-[22px]/3 uppercase">Log Out</span>
  </Button>
);

const Socials = () => (
  <div className="flex gap-4 w-full">
    <Link
      to="https://cartridge.gg/"
      target="_blank"
      className="flex-1 bg-primary-800 hover:bg-primary-700 cursor-pointer rounded-lg p-2 text-primary-100 flex items-center justify-center"
    >
      <BookIcon size="md" />
    </Link>
    <Link
      to="https://github.com/cartridge-gg/"
      target="_blank"
      className="flex-1 bg-primary-800 hover:bg-primary-700 cursor-pointer rounded-lg p-2 text-primary-100 flex items-center justify-center"
    >
      <GithubIcon size="md" />
    </Link>
    <Link
      to="https://discord.gg/cartridge"
      target="_blank"
      className="flex-1 bg-primary-800 hover:bg-primary-700 cursor-pointer rounded-lg p-2 text-primary-100 flex items-center justify-center"
    >
      <DiscordIcon size="md" />
    </Link>
    <Link
      to="https://x.com/cartridge_gg"
      target="_blank"
      className="flex-1 bg-primary-800 hover:bg-primary-700 cursor-pointer rounded-lg p-2 text-primary-100 flex items-center justify-center"
    >
      <XIcon size="md" />
    </Link>
  </div>
);
