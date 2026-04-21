import { cva, type VariantProps } from "class-variance-authority";

const leaderboardScoreVariants = cva(
  "h-10 flex items-center gap-3 md:gap-4 rounded-lg py-3 px-4 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.04)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-white-900 text-white",
        highlighted: "bg-yellow-800 text-yellow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface LeaderboardScoreProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardScoreVariants> {
  rank: number;
  username: string;
  score: number;
  reward: number;
}

const formatReward = (value: number) => value.toLocaleString("en-US");

export const LeaderboardScore = ({
  rank,
  username,
  score,
  reward,
  variant,
  className,
  ...props
}: LeaderboardScoreProps) => {
  return (
    <div
      className={leaderboardScoreVariants({ variant, className })}
      {...props}
    >
      <div className="flex-1 text-left">
        <span className="font-secondary text-xl/4">{rank}</span>
      </div>
      <div className="flex-[3] min-w-0 text-left">
        <span className="font-secondary truncate block text-xl/4">
          {username}
        </span>
      </div>
      <div className="flex-[2] text-left">
        <span className="font-secondary text-xl/4">{score}</span>
      </div>
      <div className="flex-[2] text-left">
        <span className="font-secondary text-xl/4">{formatReward(reward)}</span>
      </div>
    </div>
  );
};
