import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  count: number;
  total: number;
  barClassName?: string;
}

const progressBarVariants = cva("p-1 bg-white-900 rounded-lg", {
  variants: {
    variant: {
      default: "",
      complete: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const progressBarFillVariants = cva("h-2 rounded", {
  variants: {
    variant: {
      default: "bg-white-400",
      complete: "bg-green-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const ProgressBar = ({
  count,
  total,
  variant,
  className,
  barClassName,
  ...props
}: ProgressBarProps) => {
  const progress = total > 0 ? Math.min((count / total) * 100, 100) : 0;

  return (
    <div className={cn(progressBarVariants({ variant }), className)} {...props}>
      <motion.div
        className={cn(progressBarFillVariants({ variant }), barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
};
