import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { GlitchStateIcon, SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BalanceProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof balanceVariants> {
  balance: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

const balanceVariants = cva(
  "select-none relative rounded-lg flex items-center justify-center gap-1",
  {
    variants: {
      variant: {
        default:
          "bg-salmon-700 hover:bg-salmon-600 text-salmon-100 shadow-[inset_0_1px_0_0_var(--salmon-700),inset_1px_0_0_0_var(--salmon-800),inset_-1px_0_0_0_var(--salmon-800)]",
        faucet:
          "bg-blue-700 hover:bg-blue-600 text-blue-100 shadow-[inset_0_1px_0_0_var(--blue-700),inset_1px_0_0_0_var(--blue-800),inset_-1px_0_0_0_var(--blue-800)]",
      },
      size: {
        md: "h-12 px-3 md:px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const formatMobileBalance = (num: number): string => {
  if (Number.isNaN(num) || num < 0) {
    return "0";
  }

  if (num >= 1000000000) {
    // Billions - try to keep 3 characters
    const billions = num / 1000000000;
    if (billions >= 100) {
      return `${Math.floor(billions)}B`;
    }
    if (billions >= 10) {
      return `${billions.toFixed(1).replace(/\.0$/, "")}B`;
    }
    return `${billions.toFixed(1)}B`;
  }

  if (num >= 1000000) {
    // Millions - try to keep 3 characters
    const millions = num / 1000000;
    if (millions >= 100) {
      return `${Math.floor(millions)}M`;
    }
    if (millions >= 10) {
      return `${millions.toFixed(1).replace(/\.0$/, "")}M`;
    }
    return `${millions.toFixed(1)}M`;
  }

  if (num >= 1000) {
    // Thousands - try to keep 3 characters
    const thousands = num / 1000;
    if (thousands >= 100) {
      return `${Math.floor(thousands)}K`;
    }
    if (thousands >= 10) {
      return `${thousands.toFixed(1).replace(/\.0$/, "")}K`;
    }
    return `${thousands.toFixed(1)}K`;
  }

  // For numbers < 1000, return as integer (max 3 digits)
  return Math.floor(num).toString();
};

export const Balance = ({
  balance,
  icon,
  loading,
  variant,
  size,
  className,
  ...props
}: BalanceProps) => {
  const formattedDesktop = useMemo(() => {
    if (Number.isNaN(balance)) return "0";
    return balance.toLocaleString("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }, [balance]);

  const formattedMobile = useMemo(() => {
    return formatMobileBalance(balance);
  }, [balance]);

  return (
    <Button
      className={cn(balanceVariants({ variant, size, className }))}
      {...props}
    >
      {icon || <GlitchStateIcon variant="solid" size="sm" />}
      <div className="relative">
        <span
          className={cn(
            "block md:hidden font-secondary text-2xl px-0.5",
            loading && "invisible",
          )}
        >
          {formattedMobile}
        </span>
        <span
          className={cn(
            "hidden md:inline font-secondary text-2xl px-0.5",
            loading && "md:invisible",
          )}
        >
          {formattedDesktop}
        </span>
        {loading && (
          <SpinnerIcon
            className="absolute inset-0 m-auto animate-spin"
            size="md"
          />
        )}
      </div>
    </Button>
  );
};
