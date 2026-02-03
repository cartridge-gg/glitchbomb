import { cva, type VariantProps } from "class-variance-authority";
import { Bomb1xIcon, Bomb2xIcon, Bomb3xIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface BombDetail {
  total: number;
  count: number;
}

export interface BombDetails {
  simple: BombDetail;
  double: BombDetail;
  triple: BombDetail;
}

export interface BombTrackerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bombTrackerVariants> {
  details: BombDetails;
}

const bombTrackerVariants = cva(
  "select-none flex justify-center items-center gap-0",
  {
    variants: {
      variant: {
        default: "text-red-400",
      },
      size: {
        md: "h-10 w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const BombTracker = ({
  details,
  variant,
  size,
  className,
  ...props
}: BombTrackerProps) => {
  let keyCounter = 0;

  return (
    <div
      className={bombTrackerVariants({ variant, size, className })}
      {...props}
    >
      {Array.from({ length: details.simple.total }).map((_, index) => {
        const key = `bomb-${keyCounter++}`;
        const isEnabled = index >= details.simple.total - details.simple.count;
        return (
          <Bomb1xIcon
            key={key}
            className={cn(
              "min-h-10 min-w-8 transition-opacity duration-300",
              isEnabled ? "opacity-100" : "opacity-20",
            )}
          />
        );
      })}
      {Array.from({ length: details.double.total }).map((_, index) => {
        const key = `bomb-${keyCounter++}`;
        const isEnabled = index >= details.double.total - details.double.count;
        return (
          <Bomb2xIcon
            key={key}
            className={cn(
              "min-h-10 min-w-8 transition-opacity duration-300",
              isEnabled ? "opacity-100" : "opacity-20",
            )}
          />
        );
      })}
      {Array.from({ length: details.triple.total }).map((_, index) => {
        const key = `bomb-${keyCounter++}`;
        const isEnabled = index >= details.triple.total - details.triple.count;
        return (
          <Bomb3xIcon
            key={key}
            className={cn(
              "min-h-10 min-w-8 transition-opacity duration-300",
              isEnabled ? "opacity-100" : "opacity-20",
            )}
          />
        );
      })}
    </div>
  );
};
