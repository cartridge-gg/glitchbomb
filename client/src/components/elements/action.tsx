import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionVariants> {
  active?: boolean;
  disabled?: boolean;
}

const actionVariants = cva("select-none flex-1 min-w-0 !px-0", {
  variants: {
    variant: {
      default:
        "bg-green-950 hover:bg-green-900 rounded-xl uppercase text-sm tracking-widest text-center [&_p]:font-secondary border-0 data-[active=true]:border border-green-400 disabled:text-green-900",
    },
    size: {
      md: "h-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Action = ({
  active,
  disabled,
  variant,
  size,
  className,
  children,
  ...props
}: ActionProps) => {
  return (
    <Button
      variant="secondary"
      data-active={active}
      disabled={disabled}
      className={cn(actionVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Button>
  );
};
