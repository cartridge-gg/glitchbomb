import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface ReferralStatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof referralStatVariants> {
  label: string;
  value: string;
  wide?: boolean;
}

const referralStatVariants = cva(
  "flex flex-col items-center justify-center gap-4 rounded-xl bg-white-900 p-4 text-center shadow-[inset_1px_1px_0px_rgba(255,255,255,0.04),1px_1px_0px_rgba(0,0,0,0.12)] md:px-4 md:py-6",
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

export const ReferralStat = ({
  label,
  value,
  wide = false,
  variant,
  className,
  ...props
}: ReferralStatProps) => {
  return (
    <div
      className={cn(
        referralStatVariants({ variant }),
        wide && "md:col-span-2",
        className,
      )}
      {...props}
    >
      <span className="font-secondary text-base/[9px] text-white-400 md:text-lg/[10px]">
        {label}
      </span>
      <span
        className="text-2xl/[17px] uppercase tracking-tight text-white-100 md:text-[2rem]/[22px]"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
      >
        {value}
      </span>
    </div>
  );
};
