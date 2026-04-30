import { cva, type VariantProps } from "class-variance-authority";
import { GlitchText } from "@/components/ui/glitch-text";
import { cn } from "@/lib/utils";

const gamePointsVariants = cva("flex flex-col gap-1 items-center", {
  variants: {
    variant: {
      default: "px-2.5",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface GamePointsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gamePointsVariants> {
  points: number;
  level: number;
}

export const GamePoints = ({
  points,
  level,
  variant,
  className,
  ...props
}: GamePointsProps) => {
  return (
    <div className={cn(gamePointsVariants({ variant, className }))} {...props}>
      <GlitchText
        className="text-primary-100 animate-glitch-full text-[56px]/[48px]"
        text={String(points)}
      />
      <GlitchText
        className="font-secondary text-primary-100 text-sm/4"
        text={`Level ${level}`}
      />
    </div>
  );
};
