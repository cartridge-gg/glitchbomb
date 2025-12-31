import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

export interface GoalTrackerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof goalTrackerVariants> {
  value: number;
  total: number;
}

const goalTrackerVariants = cva(
  "relative flex rounded-full overflow-hidden justify-center items-center",
  {
    variants: {
      variant: {
        default: "text-green-400  bg-green-950",
      },
      size: {
        md: "h-5 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const GoalTracker = ({
  value,
  total,
  variant,
  size,
  className,
  ...props
}: GoalTrackerProps) => {
  const percentage = (value / total) * 100;

  return (
    <div
      className={goalTrackerVariants({ variant, size, className })}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-green-900 h-full"
        initial={{ width: "0%" }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      />
      <p className="relative uppercase font-secondary text-2xs tracking-widest pr-1 pl-4 whitespace-nowrap">
        {`Goal : ${total} pts`}
      </p>
    </div>
  );
};
