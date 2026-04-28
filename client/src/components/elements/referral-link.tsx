import { cva, type VariantProps } from "class-variance-authority";
import { CopyIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReferralLinkProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onCopy">,
    VariantProps<typeof referralLinkVariants> {
  onCopy?: () => void;
}

const referralLinkVariants = cva(
  "inline-flex h-10 w-auto cursor-pointer items-center gap-0 overflow-hidden rounded-lg p-0 transition-opacity hover:opacity-80",
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

export const ReferralLink = ({
  onCopy,
  onClick,
  variant,
  className,
  type = "button",
  ...props
}: ReferralLinkProps) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      onCopy?.();
    }
  };

  return (
    <Button
      type={type}
      variant="ghost"
      className={cn(referralLinkVariants({ variant }), className)}
      onClick={handleClick}
      {...props}
    >
      <span className="flex h-10 w-40 items-center bg-green-800 px-3 py-2.5">
        <span className="font-secondary text-lg/[18px] text-green-100">
          COPY REFERRAL LINK
        </span>
      </span>
      <span className="flex size-10 items-center justify-center bg-green-700 text-green-100">
        <CopyIcon size="sm" />
      </span>
    </Button>
  );
};
