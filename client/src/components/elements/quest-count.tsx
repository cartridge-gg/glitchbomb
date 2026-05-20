import { cva, type VariantProps } from "class-variance-authority";
import { QuestIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface QuestCountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questCountVariants> {
  count: number;
  total: number;
}

const questCountVariants = cva(
  "flex justify-center items-center px-1.5 py-1 gap-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary-900 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const QuestCount = ({
  count,
  total,
  variant,
  className,
  ...props
}: QuestCountProps) => {
  return (
    <div className={cn(questCountVariants({ variant, className }))} {...props}>
      <QuestIcon size="md" className="text-primary-100" />
      <div className="flex items-center gap-0.5 text-2xl/[13px] px-1">
        <span className="text-primary-100 font-secondary">{count}</span>
        <span className="text-white-400 font-secondary text-base/[13px]">
          /
        </span>
        <span className="text-white-100 font-secondary">{total}</span>
      </div>
    </div>
  );
};
