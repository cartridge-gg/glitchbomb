import { cva, type VariantProps } from "class-variance-authority";
import { LaurelIcon } from "@/components/icons";

const achievementCountVariants = cva(
  "inline-flex items-center gap-2 rounded-lg bg-white-900 px-4 py-3",
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

export interface AchievementCountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementCountVariants> {
  count: number;
  total: number;
}

export const AchievementCount = ({
  count,
  total,
  variant,
  className,
  ...props
}: AchievementCountProps) => {
  return (
    <div
      className={achievementCountVariants({ variant, className })}
      {...props}
    >
      <LaurelIcon size="md" className="text-green-100" />
      <p>
        <span className="font-secondary text-2xl/5 text-green-100">
          <span className="font-inherit">{count}</span>
          <span className="font-inherit text-white-400">/</span>
          <span className="font-inherit text-white-100">{total}</span>
        </span>
      </p>
    </div>
  );
};
