import { cva, type VariantProps } from "class-variance-authority";
import {
  AchievementCard,
  type AchievementCardProps,
} from "@/components/elements/achievement-card";

const achievementsVariants = cva(
  "flex h-full w-full min-h-0 flex-col overflow-hidden",
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

export interface AchievementsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementsVariants> {
  achievements: (AchievementCardProps & { id: string })[];
}

const getPadding = (count: number) => {
  if (count === 0) {
    return { mobile: 2, desktopOnly: 2 };
  }

  const mobile = (2 - (count % 2)) % 2;
  const desktop = (4 - (count % 4)) % 4;

  return { mobile, desktopOnly: desktop - mobile };
};

export const Achievements = ({
  achievements,
  variant,
  className,
  ...props
}: AchievementsProps) => {
  const earned = achievements.filter(
    (achievement) => achievement.variant === "complete",
  );
  const remaining = achievements.filter(
    (achievement) => achievement.variant !== "complete",
  );

  return (
    <div className={achievementsVariants({ variant, className })} {...props}>
      <div
        className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1"
        style={{ scrollbarWidth: "none" }}
      >
        <AchievementSection title="Earned" achievements={earned} />
        <AchievementSection title="Remaining" achievements={remaining} />
      </div>
    </div>
  );
};

const AchievementSection = ({
  title,
  achievements,
}: {
  title: string;
  achievements: AchievementCardProps[];
}) => {
  const padding = getPadding(achievements.length);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-white-400">
        <span className="font-secondary text-2xl/6">{title}</span>
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={`${title}-${achievement.title ?? index}`}
            {...achievement}
          />
        ))}
        {Array.from({ length: padding.mobile }, (_, index) => (
          <AchievementCard
            key={`${title}-pad-mobile-${index}`}
            variant="empty"
          />
        ))}
        {Array.from({ length: padding.desktopOnly }, (_, index) => (
          <AchievementCard
            key={`${title}-pad-desktop-${index}`}
            variant="empty"
            className="hidden md:flex"
          />
        ))}
      </div>
    </section>
  );
};
