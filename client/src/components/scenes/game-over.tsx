import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { BagIcon, GlitchStateIcon, PlusIcon } from "@/components/icons";
import { GlitchText } from "@/components/ui/glitch-text";
import { tokenPayout, toTokens } from "@/helpers/payout";
import { cn } from "@/lib/utils";
import type { OrbPulled } from "@/models";
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
  /** Moonrocks earned during the game (used for the balance pill and payout calc). */
  moonrocksEarned: number;
  /** Chart data points for the P/L graph (absolute potential moonrocks). */
  plData: GameChartDataPoint[];
  /** Pulls history paired with chart points for the per-dot tooltip. */
  pulls: OrbPulled[];
  /** True = voluntarily cashed out, false = died (health = 0). */
  cashedOut: boolean;
  /** True = game expired without being played to completion. */
  expired?: boolean;
  /** Stake tier; required to compute the GLITCH payout. */
  stake?: number;
  /** GLITCH/USD price; required to compute the USD value. */
  tokenPrice?: number | null;
  /** Token total supply (used by the on-chain payout formula). */
  supply?: bigint;
  /** Token target supply (used by the on-chain payout formula). */
  target?: bigint;
  onPlayAgain?: () => void;
  onOpenStash?: () => void;
}

export const GameOver = ({
  moonrocksEarned,
  plData,
  pulls,
  cashedOut,
  expired,
  stake,
  tokenPrice,
  supply,
  target,
  onPlayAgain,
  onOpenStash,
  variant,
  className,
  ...props
}: GameOverProps) => {
  // Compute GLITCH payout and USD value from on-chain rewarder math.
  const { payout, value } = useMemo(() => {
    if (stake == null || moonrocksEarned <= 0) {
      return { payout: 0, value: null as number | null };
    }
    const raw = tokenPayout(moonrocksEarned, stake, supply ?? 0n, target ?? 0n);
    const tokens = toTokens(raw);
    const usd =
      tokenPrice != null && tokenPrice > 0 ? tokens * tokenPrice : null;
    return { payout: tokens, value: usd };
  }, [stake, moonrocksEarned, supply, target, tokenPrice]);

  const title = expired ? "Expired" : cashedOut ? "Cashed Out" : "Glitched Out";

  return (
    <div
      className={cn(gameOverSceneVariants({ variant, className }))}
      {...props}
    >
      <h2 className="h-12 text-[2.5rem] md:text-[3rem] text-green-100 uppercase self-center">
        <GlitchText
          text={title}
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
    <div className="flex-1 p-6 flex flex-col justify-center items-center gap-2 rounded-t-lg bg-primary-900 shadow-[inset_1px_1px_0_0_var(--white-900)]">
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
    <div className="flex-1 p-6 flex flex-col justify-center items-center gap-2 rounded-b-lg bg-primary-900 shadow-[inset_1px_1px_0_0_var(--white-900)]">
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
