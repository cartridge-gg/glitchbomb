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
  "flex justify-center items-center p-2.5 gap-2 bg-white-900 rounded-lg",
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
      <div className="flex items-center gap-1 text-2xl/[13px]">
        <span className="text-primary-100 font-secondary">{count}</span>
        <span className="text-white-400 font-secondary">/</span>
        <span className="text-white-100 font-secondary">{total}</span>
      </div>
    </div>
  );
};
