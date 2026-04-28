import { cva, type VariantProps } from "class-variance-authority";
import { LeaderboardScores } from "@/components/containers/leaderboard-scores";
import { Close } from "@/components/elements/close";
import type { LeaderboardScoreProps } from "@/components/elements/leaderboard-score";
import { GlitchText } from "@/components/ui/glitch-text";

export interface LeaderboardSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof leaderboardSceneVariants> {
  rows: LeaderboardScoreProps[];
  onClose?: () => void;
}

const leaderboardSceneVariants = cva(
  "relative flex flex-col gap-6 p-6 md:p-8 rounded-lg outline outline-4 -outline-offset-4 outline-green-600 bg-[#040603] overflow-hidden",
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

export const LeaderboardScene = ({
  rows,
  onClose,
  variant,
  className,
  ...props
}: LeaderboardSceneProps) => {
  return (
    <div
      className={leaderboardSceneVariants({ variant, className })}
      {...props}
    >
      {onClose && (
        <Close size="md" onClick={onClose} className="absolute top-4 right-4" />
      )}

      <h2 className="text-2xl/8 md:text-[2.5rem] text-green-100 uppercase tracking-tight">
        <GlitchText
          text="Leaderboard"
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>

      <LeaderboardScores rows={rows} className="flex-1 min-h-0" />
    </div>
  );
};
