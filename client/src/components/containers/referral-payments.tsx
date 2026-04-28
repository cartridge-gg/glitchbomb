import { cva, type VariantProps } from "class-variance-authority";
import {
  ReferralPayment,
  type ReferralPaymentProps,
} from "@/components/elements/referral-payment";
import { cn } from "@/lib/utils";

export interface ReferralPaymentsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralPaymentsVariants> {
  payments: ReferralPaymentProps[];
  emptyLabel?: string;
}

const referralPaymentsVariants = cva(
  "flex min-h-0 w-full flex-col gap-3 overflow-y-auto",
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

export const ReferralPayments = ({
  payments,
  emptyLabel = "No referral payments yet",
  variant,
  className,
  ...props
}: ReferralPaymentsProps) => {
  return (
    <div
      className={cn(referralPaymentsVariants({ variant }), className)}
      style={{ scrollbarWidth: "none" }}
      {...props}
    >
      {payments.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg bg-white-900 px-6 py-12 text-center">
          <span className="font-secondary text-lg text-white-400">
            {emptyLabel}
          </span>
        </div>
      ) : (
        payments.map((payment, index) => (
          <ReferralPayment key={index} {...payment} />
        ))
      )}
    </div>
  );
};
