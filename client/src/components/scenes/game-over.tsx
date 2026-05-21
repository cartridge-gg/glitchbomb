import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useMemo } from "react";
import { BagIcon, GlitchStateIcon, PlusIcon } from "@/components/icons";
import { GlitchText } from "@/components/ui/glitch-text";
import { DEFAULT_THEME, useTheme } from "@/contexts/theme";
import { tokenPayout, toTokens } from "@/helpers/payout";
import { cn } from "@/lib/utils";
import type { Game, OrbPulled } from "@/models";
import { GameBalance, GameChart, type GameChartDataPoint } from "../elements";
import { Button } from "../ui/button";

const gameOverSceneVariants = cva("flex flex-col gap-8 items-stretch p-4", {
  variants: {
    variant: {
      default: "h-full min-h-0 mx-auto p-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface GameOverProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameOverSceneVariants> {
  /** The finished game; drives title, payout and balance display. */
  game: Game;
  /** Chart data points for the P/L graph (absolute potential moonrocks). */
  plData: GameChartDataPoint[];
  /** Pulls history paired with chart points for the per-dot tooltip. */
  pulls: OrbPulled[];
  /** GLITCH/USD price; required to compute the USD value. */
  tokenPrice?: number | null;
  /** Token total supply (used by the on-chain payout formula). */
  supply?: bigint;
  /** Token target supply (used by the on-chain payout formula). */
  target?: bigint;
  onPlayAgain?: () => void;
  onOpenStash?: () => void;
}

const resolveTitle = (game: Game): string => {
  if (game.isWon()) return "Big Win!";
  if (game.isCashedOut()) return "Cashed Out";
  if (game.isGlitchedOut()) return "Glitched Out";
  if (game.isExpired()) return "Timed out";
  return "";
};

export const GameOver = ({
  game,
  plData,
  pulls,
  tokenPrice,
  supply,
  target,
  onPlayAgain,
  onOpenStash,
  variant,
  className,
  ...props
}: GameOverProps) => {
  const { setTheme } = useTheme();
  const isGlitchedOut = game.isGlitchedOut();

  useEffect(() => {
    if (!isGlitchedOut) return;
    setTheme("glitch");
    return () => setTheme(DEFAULT_THEME);
  }, [isGlitchedOut, setTheme]);

  const moonrocksEarned = game.moonrocks;
  const stake = game.stake;

  // Compute GLITCH payout and USD value from on-chain rewarder math.
  const { payout, value } = useMemo(() => {
    if (moonrocksEarned <= 0) {
      return { payout: 0, value: null as number | null };
    }
    const raw = tokenPayout(moonrocksEarned, stake, supply ?? 0n, target ?? 0n);
    const tokens = toTokens(raw);
    const usd =
      tokenPrice != null && tokenPrice > 0 ? tokens * tokenPrice : null;
    return { payout: tokens, value: usd };
  }, [stake, moonrocksEarned, supply, target, tokenPrice]);

  const title = resolveTitle(game);

  return (
    <div
      className={cn(gameOverSceneVariants({ variant, className }))}
      {...props}
    >
      <h2 className="h-12 text-[2.5rem] md:text-[3rem] text-primary-100 uppercase self-center whitespace-nowrap">
        <GlitchText
          text={title}
          className={game.isGlitchedOut() ? "animate-glitch-full" : undefined}
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>

      <GameBalance
        variant="moonrocks"
        size="lg"
        value={moonrocksEarned}
        className="w-fit self-center"
      />

      <GameChart
        className="min-h-[140px] max-h-[140px]"
        data={plData}
        pulls={pulls}
        mode="absolute"
        title="POTENTIAL"
      />

      <div className="flex flex-col flex-1 gap-0.5">
        <Payout payout={payout} />
        <Value value={value} />
      </div>

      <Actions onOpenStash={onOpenStash} onPlayAgain={onPlayAgain} />
    </div>
  );
};

const Payout = ({ payout }: { payout: number }) => {
  const formatted = Number.isInteger(payout)
    ? payout.toString()
    : payout.toFixed(2);
  return (
    <div className="flex-1 px-6 py-2 flex flex-col justify-center items-center gap-2 rounded-t-lg bg-primary-900 shadow-[inset_1px_1px_0_0_var(--white-900)]">
      <h2 className="text-salmon-300 font-secondary uppercase text-2xl/6">
        Payout
      </h2>
      <div className="text-salmon-100 flex gap-0 items-center pr-1">
        <GlitchStateIcon className="h-9 w-9" variant="solid" />
        <span className="font-secondary uppercase text-[40px]/10 px-1">
          {formatted}
        </span>
      </div>
    </div>
  );
};

const Value = ({ value }: { value: number | null }) => {
  const formatted = value != null ? `$${value.toFixed(2)}` : "—";
  return (
    <div className="flex-1 px-6 py-2 flex flex-col justify-center items-center gap-2 rounded-b-lg bg-primary-900 shadow-[inset_1px_1px_0_0_var(--white-900)]">
      <h2 className="text-primary-300 font-secondary uppercase text-2xl/6">
        Value
      </h2>
      <div className="text-primary-100 flex gap-0 items-center pr-1">
        <span className="font-secondary uppercase text-[40px]/10 px-1">
          {formatted}
        </span>
      </div>
    </div>
  );
};

interface ActionsProps {
  onPlayAgain?: () => void;
  onOpenStash?: () => void;
}

const Actions = ({ onOpenStash, onPlayAgain }: ActionsProps) => {
  return (
    <div className="flex gap-3 md:gap-4">
      <div className="flex-1" data-tutorial-id="bag-button">
        <Button
          variant="secondary"
          className="w-full h-12"
          onClick={onOpenStash}
        >
          <BagIcon size="sm" />
          <span className="font-secondary text-2xl uppercase">Orbs</span>
        </Button>
      </div>
      <div className="flex-1" data-tutorial-id="cash-out-button">
        <Button
          variant="tertiary"
          className="w-full h-12"
          onClick={onPlayAgain}
        >
          <PlusIcon size="sm" />
          <span className="font-secondary text-2xl uppercase">New Game</span>
        </Button>
      </div>
    </div>
  );
};
