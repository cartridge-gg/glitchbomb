import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { SpinnerIcon } from "../icons";

export interface PurchaseDetailProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof purchaseDetailVariants> {
  title: string;
  previous?: string;
  content: string;
  discount?: string;
  loading?: boolean;
}

const purchaseDetailVariants = cva(
  "relative px-3 py-3 gap-2 flex justify-between",
  {
    variants: {
      variant: {
        default: "h-10 w-full bg-white-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const PurchaseDetail = ({
  title,
  previous,
  content,
  discount,
  loading,
  variant,
  className,
  ...props
}: PurchaseDetailProps) => {
  return (
    <div
      className={cn(purchaseDetailVariants({ variant, className }))}
      {...props}
    >
      <div className="flex gap-3 items-center">
        <h3 className="text-white-100 text-lg font-secondary">{title}</h3>
        {discount ? (
          <p className="h-5 px-1 bg-primary-800 rounded flex items-center">
            <span className="font-secondary text-primary-100 text-lg">
              {discount}
            </span>
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        {loading ? (
          <SpinnerIcon
            size="sm"
            className="animate-spin text-white-400 shrink-0"
          />
        ) : (
          <p
            className={cn(
              "font-secondary text-lg",
              !previous ? "text-primary-100" : "text-tertiary-100",
            )}
          >
            {previous ? (
              <span className="font-secondary text-tertiary-400 text-lg line-through mr-2">
                {previous}
              </span>
            ) : null}
            {content}
          </p>
        )}
      </div>
    </div>
  );
};
