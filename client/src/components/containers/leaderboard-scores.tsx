import { cva, type VariantProps } from "class-variance-authority";
import {
  LeaderboardScore as LeaderboardScoreRow,
  type LeaderboardScoreProps as LeaderboardScoreRowProps,
} from "@/components/elements/leaderboard-score";

export interface LeaderboardScoresProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardScoresVariants> {
  rows: LeaderboardScoreRowProps[];
}

const leaderboardScoresVariants = cva(
  "select-none overflow-hidden h-full w-full flex flex-col gap-6",
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

export const LeaderboardScores = ({
  rows,
  variant,
  className,
  ...props
}: LeaderboardScoresProps) => {
  return (
    <div
      className={leaderboardScoresVariants({ variant, className })}
      {...props}
    >
      <div className="h-4 flex items-center gap-3 md:gap-4 px-4">
        <div className="flex-1 text-left">
          <span className="font-secondary text-lg/4 text-white-400">
            <span className="hidden md:inline font-inherit">Rank</span>
            <span className="inline md:hidden font-inherit">#</span>
          </span>
        </div>
        <div className="flex-[3] min-w-0 text-left">
          <span className="font-secondary text-lg/4 text-white-400">
            Player
          </span>
        </div>
        <div className="flex-[2] text-left">
          <span className="font-secondary text-lg/4 text-white-400">Score</span>
        </div>
        <div className="flex-[2] text-left">
          <span className="font-secondary text-lg/4 text-white-400">
            Earned
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white-900 rounded-lg py-12 flex items-center justify-center h-full">
          <p className="font-secondary text-white-400 text-lg text-center">
            No scores yet
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {rows.map((row, index) => (
            <LeaderboardScoreRow key={index} {...row} />
          ))}
        </div>
      )}
    </div>
  );
};
