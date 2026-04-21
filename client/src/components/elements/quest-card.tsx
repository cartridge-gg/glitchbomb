import { cva, type VariantProps } from "class-variance-authority";
import { CheckboxCheckedIcon, CheckboxUncheckedIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const questCardVariants = cva(
  "flex w-full flex-col gap-3 rounded-lg p-4 shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      variant: {
        default: "bg-white-900",
        complete: "bg-green-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface QuestCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questCardVariants> {
  title: string;
  description: string;
  count: number;
  total: number;
  icon?: React.ReactNode;
}

export const QuestCard = ({
  title,
  description,
  count,
  total,
  icon,
  variant,
  className,
  ...props
}: QuestCardProps) => {
  const safeCount = Math.max(0, count);
  const safeTotal = Math.max(0, total);
  const progress =
    safeTotal > 0 ? Math.min((safeCount / safeTotal) * 100, 100) : 0;
  const isComplete = variant === "complete" || safeCount >= safeTotal;

  return (
    <div className={questCardVariants({ variant, className })} {...props}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg",
            isComplete ? "bg-green-800" : "bg-white-900",
          )}
        >
          {icon ?? (
            <div
              className={cn(
                "size-6 rounded-md",
                isComplete ? "bg-green-400" : "bg-white-400",
              )}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3
            className={cn(
              "min-w-0 truncate",
              isComplete ? "text-green-400" : "text-white-100",
            )}
          >
            <span className="font-secondary text-xl/5">{title}</span>
          </h3>

          <div className="flex items-start gap-2">
            {isComplete ? (
              <CheckboxCheckedIcon
                size="sm"
                className="mt-0.5 shrink-0 text-white-400"
              />
            ) : (
              <CheckboxUncheckedIcon
                size="sm"
                className="mt-0.5 shrink-0 text-white-400"
              />
            )}
            <p className="min-w-0 flex-1">
              <span
                className={cn(
                  "font-secondary text-lg/4",
                  isComplete ? "text-green-400 line-through" : "text-white-400",
                )}
              >
                {description}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-4 flex-1 overflow-hidden rounded-lg p-1",
            isComplete ? "bg-green-800" : "bg-white-900",
          )}
        >
          <div
            className={cn(
              "h-full rounded-md transition-[width] duration-300",
              isComplete ? "bg-green-100" : "bg-white-100",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="shrink-0 text-right">
          <span className="font-secondary text-lg/4 text-white-100">
            <span
              className={cn("font-inherit", isComplete && "text-green-100")}
            >
              {safeCount}
            </span>
            <span className="font-inherit text-white-400"> of </span>
            <span className="font-inherit">{safeTotal}</span>
          </span>
        </p>
      </div>
    </div>
  );
};
