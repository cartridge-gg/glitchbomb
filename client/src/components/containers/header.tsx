import { cva, type VariantProps } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { Balance, NotificationPing } from "@/components/elements";
import {
  GlitchBombIcon,
  LaurelIcon,
  ListIcon,
  QuestIcon,
  TokenIcon,
  TrophyIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  tokenBalance?: number;
  faucetBalance?: number;
  onBalance?: () => void;
  onFaucet?: () => void;
  onConnect?: () => void;
  onQuests?: () => void;
  onAchievements?: () => void;
  onLeaderboard?: () => void;
  onSettings?: () => void;
  hasQuestNotification?: boolean;
  hasAchievementNotification?: boolean;
  hasSettingsNotification?: boolean;
}

const headerVariants = cva(
  "w-full min-h-16 md:min-h-24 p-4 md:p-8 flex items-center justify-between",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const Header = ({
  tokenBalance,
  onBalance,
  onConnect,
  onQuests,
  onAchievements,
  onLeaderboard,
  onSettings,
  hasQuestNotification,
  hasAchievementNotification,
  hasSettingsNotification,
  faucetBalance,
  onFaucet,
  variant,
  className,
  ...props
}: HeaderProps) => {
  const [faucetLoading, setFaucetLoading] = useState(false);
  const prevFaucetBalance = useRef(faucetBalance);

  useEffect(() => {
    if (faucetLoading && faucetBalance !== prevFaucetBalance.current) {
      setFaucetLoading(false);
    }
    prevFaucetBalance.current = faucetBalance;
  }, [faucetBalance, faucetLoading]);

  const handleFaucet = useCallback(() => {
    setFaucetLoading(true);
    onFaucet?.();
  }, [onFaucet]);

  return (
    <div className={cn(headerVariants({ variant, className }))} {...props}>
      <Link
        to="/"
        className="flex items-center justify-start gap-2 cursor-pointer select-none"
        draggable={false}
      >
        <Button variant="ghost" className="p-0">
          <GlitchBombIcon size="lg+" className="text-primary-100 glitch-icon" />
          <h1 className="hidden md:block text-[40px] translate-y-1">
            <strong className="text-primary-100 leading-10 animate-glitch-full">
              GLITCH
            </strong>
            <span className="text-white-100 leading-10">BOMB</span>
          </h1>
        </Button>
      </Link>
      <div className="flex items-center justify-start gap-2 md:gap-4">
        {onLeaderboard && (
          <Button variant="secondary" size="icon" onClick={onLeaderboard}>
            <TrophyIcon variant="solid" size="md" />
          </Button>
        )}
        {onQuests && (
          <Button
            variant="secondary"
            size="icon"
            className="hidden md:flex"
            onClick={onQuests}
          >
            <QuestIcon size="md" />
            {hasQuestNotification && <NotificationPing />}
          </Button>
        )}
        {onAchievements && (
          <Button
            variant="secondary"
            size="icon"
            className="hidden md:flex"
            onClick={onAchievements}
          >
            <LaurelIcon size="md" />
            {hasAchievementNotification && <NotificationPing />}
          </Button>
        )}
        {/* Faucet balance */}
        {faucetBalance !== undefined && !!onFaucet && !onConnect && (
          <Balance
            variant="faucet"
            size="md"
            icon={<TokenIcon size="xs" />}
            balance={faucetBalance}
            onClick={handleFaucet}
          />
        )}
        {/* Glitch balance */}
        {tokenBalance !== undefined && !onConnect && (
          <Balance
            variant="default"
            size="md"
            balance={tokenBalance}
            onClick={onBalance}
            className="pointer-events-none"
          />
        )}
        {onSettings && (
          <Button variant="secondary" size="icon" onClick={onSettings}>
            <ListIcon size="md" />
            {hasSettingsNotification && <NotificationPing />}
          </Button>
        )}
        {!!onConnect && (
          <Button
            variant="constructive"
            className="h-full font-secondary text-2xl"
            onClick={onConnect}
          >
            LOG IN
          </Button>
        )}
      </div>
    </div>
  );
};
