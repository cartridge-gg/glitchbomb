import { cva, type VariantProps } from "class-variance-authority";
import { AlertIcon, TrophyIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const achievementCardVariants = cva(
  "flex aspect-[162/126] min-h-[127px] w-full flex-col items-center justify-center gap-3 rounded-lg p-4 text-center shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)] md:p-5",
  {
    variants: {
      variant: {
        complete:
          "bg-green-800 outline outline-1 -outline-offset-1 outline-green-600",
        inProgress: "bg-white-900",
        locked: "bg-white-900",
        empty: "bg-white-900",
      },
    },
    defaultVariants: {
      variant: "inProgress",
    },
  },
);

export interface AchievementCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementCardVariants> {
  title?: string;
  icon?: React.ReactNode;
  count?: number;
  total?: number;
}

const AchievementCardFallbackIcon = ({
  variant,
}: {
  variant: NonNullable<AchievementCardProps["variant"]>;
}) => {
  if (variant === "locked") {
    return <TrophyIcon variant="line" size="xl" className="text-white-500" />;
  }

  return (
    <AlertIcon
      size="xl"
      className={cn(
        variant === "complete" ? "text-green-100" : "text-white-500",
      )}
    />
  );
};

export const AchievementCard = ({
  title,
  icon,
  count = 0,
  total = 0,
  variant = "inProgress",
  className,
  ...props
}: AchievementCardProps) => {
  if (variant === "empty") {
    return (
      <div
        className={achievementCardVariants({ variant, className })}
        {...props}
      />
    );
  }

  const progress = total > 0 ? Math.min((count / total) * 100, 100) : 0;
  const resolvedTitle = variant === "locked" ? "Hidden" : title;
  const iconNode = icon ?? <AchievementCardFallbackIcon variant={variant} />;

  return (
    <div className={achievementCardVariants({ variant, className })} {...props}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 self-stretch">
        <div className="flex size-14 items-center justify-center md:size-16">
          {iconNode}
        </div>

        <p className="w-full">
          <span
            className={cn(
              "block truncate font-secondary text-[2rem]/[0.95] tracking-tight md:text-[2.25rem]/[0.95]",
              variant === "complete" && "text-green-100",
              variant === "inProgress" && "text-white-400",
              variant === "locked" && "text-white-400",
            )}
          >
            {resolvedTitle}
          </span>
        </p>
      </div>

      {variant === "inProgress" ? (
        <div className="h-4 w-full overflow-hidden rounded-lg bg-white-900 p-1">
          <div
            className="h-full rounded-md bg-white-100 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
};
