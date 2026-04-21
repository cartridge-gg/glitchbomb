import { cva, type VariantProps } from "class-variance-authority";
import { QuestIcon } from "@/components/icons";

const questCountVariants = cva(
  "flex items-center gap-2 rounded-lg bg-white-900 px-3 py-2",
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

export interface QuestCountProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questCountVariants> {
  count: number;
  total: number;
}

export const QuestCount = ({
  count,
  total,
  variant,
  className,
  ...props
}: QuestCountProps) => {
  return (
    <div className={questCountVariants({ variant, className })} {...props}>
      <QuestIcon size="sm" className="text-green-100" />
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
