import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownIcon, TokenIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface ReferralPaymentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralPaymentVariants> {
  amount: string;
  token: string;
  from: string;
  timeAgo: string;
}

const referralPaymentVariants = cva(
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

export const ReferralPayment = ({
  amount,
  token,
  from,
  timeAgo,
  variant,
  className,
  ...props
}: ReferralPaymentProps) => {
  return (
    <div
      className={cn(referralPaymentVariants({ variant }), className)}
      {...props}
    >
      <ArrowDownIcon size="md" className="shrink-0 text-white-100" />

      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        <span className="flex shrink-0 items-center gap-0.5 rounded bg-white-900 p-0.5">
          <span className="flex size-4 items-center justify-center">
            <TokenIcon size="xs" />
          </span>
          <span className="font-secondary text-base/4 text-white-100 px-0.5">
            {amount} {token}
          </span>
        </span>
        <span className="font-secondary text-base/4 text-white-400">from</span>
        <span className="flex items-center rounded bg-white-900 px-1 py-0.5 h-6">
          <span className="truncate font-secondary text-base/4 text-white-100">
            {from}
          </span>
        </span>
      </div>

      <span className="w-10 shrink-0 text-right font-secondary text-base/4 text-white-400">
        {timeAgo}
      </span>
    </div>
  );
};
