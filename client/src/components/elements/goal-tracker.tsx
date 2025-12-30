import { cva, type VariantProps } from "class-variance-authority";

export interface GoalTrackerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof goalTrackerVariants> {
  value: number;
  label?: string;
}

const goalTrackerVariants = cva("flex rounded-full overflow-hidden", {
  variants: {
    variant: {
      default: "text-green-100",
    },
    size: {
      md: "h-5 w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const GoalTracker = ({
  value,
  label = "Goal :",
  variant,
  size,
  className,
  ...props
}: GoalTrackerProps) => {
  return (
    <div
      className={goalTrackerVariants({ variant, size, className })}
      {...props}
    >
      <div className="flex items-center justify-end h-full w-1/2 bg-green-300">
        <p className="uppercase font-secondary text-2xs tracking-widest pr-1 pl-4 whitespace-nowrap">
          {label}
        </p>
      </div>
      <div className="flex items-center justify-start h-full w-1/2 bg-green-500">
        <p className="uppercase font-secondary text-2xs tracking-widest pl-2 pr-4 whitespace-nowrap">{`${value} pts`}</p>
      </div>
    </div>
  );
};
