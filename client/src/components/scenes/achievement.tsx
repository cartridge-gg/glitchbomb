import { cva, type VariantProps } from "class-variance-authority";
import {
  Achievements,
  type AchievementsProps,
} from "@/components/containers/achievements";
import { AchievementCount, Close } from "@/components/elements";
import { GlitchText } from "@/components/ui/glitch-text";

const achievementSceneVariants = cva(
  "relative flex flex-col gap-6 overflow-hidden rounded-lg bg-[#040603] p-6 outline outline-4 -outline-offset-4 outline-green-600 md:p-8",
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

export interface AchievementSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementSceneVariants> {
  achievements: AchievementsProps["achievements"];
  onClose?: () => void;
}

export const AchievementScene = ({
  achievements,
  onClose,
  variant,
  className,
  ...props
}: AchievementSceneProps) => {
  const completedCount = achievements.filter(
    (achievement) => achievement.variant === "complete",
  ).length;

  return (
    <div
      className={achievementSceneVariants({ variant, className })}
      {...props}
    >
      {onClose ? (
        <Close size="md" onClick={onClose} className="absolute top-3 right-3" />
      ) : null}

      <h2 className="text-2xl/8 md:text-[2.5rem] text-green-100 uppercase tracking-tight">
        <GlitchText
          text="Achievements"
          style={{
            textShadow:
              "2px 2px 0px rgba(255, 0, 0, 0.25), -2px -2px 0px rgba(0, 0, 255, 0.25)",
          }}
        />
      </h2>

      <AchievementCount
        count={completedCount}
        total={achievements.length}
        className="w-fit"
      />

      <Achievements achievements={achievements} className="flex-1 min-h-0" />
    </div>
  );
};
