import { cva, type VariantProps } from "class-variance-authority";
import { HeartIcon, SparklesIcon } from "@/components/icons";
import { GlitchText } from "@/components/ui/glitch-text";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

const gameStatVariants = cva(
  "flex flex-col gap-1 justify-between items-stretch",
  {
    variants: {
      variant: {
        health: "text-salmon-100",
        goal: "text-green-100",
      },
    },
    defaultVariants: {
      variant: "health",
    },
  },
);

export interface GameStatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameStatVariants> {
  value: number;
  max: number;
}

const getIcon = (variant: NonNullable<GameStatProps["variant"]>) => {
  switch (variant) {
    case "goal":
      return SparklesIcon;
    default:
      return HeartIcon;
  }
};

const getLabel = (variant: NonNullable<GameStatProps["variant"]>) => {
  switch (variant) {
    case "goal":
      return "Goal:";
    default:
      return "Health:";
  }
};

export const GameStat = ({
  value,
  max,
  variant,
  className,
  ...props
}: GameStatProps) => {
  const label = getLabel(variant ?? "health");
  const Icon = getIcon(variant ?? "health");
  return (
    <div className={cn(gameStatVariants({ variant, className }))} {...props}>
      <div className="flex items-center justify-between">
        <span className="font-secondary text-xl">{label}</span>
        <div className="flex items-center gap-0.5">
          <Icon size="xs" />
          <GlitchText
            className="font-secondary text-xl/4"
            text={String(value)}
          />
        </div>
      </div>
      <ProgressBar
        count={value}
        total={max}
        className="rounded-md p-0.5 h-4"
        barClassName={cn(
          "rounded-sm h-3",
          variant === "goal" ? "bg-green-100" : "bg-salmon-100",
        )}
      />
    </div>
  );
};
