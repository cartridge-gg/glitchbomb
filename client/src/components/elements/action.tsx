import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface ActionProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionVariants> {
  active?: boolean;
  disabled?: boolean;
}

const actionVariants = cva("select-none", {
  variants: {
    variant: {
      default:
        "bg-green-500 hover:bg-green-300 rounded-xl uppercase text-sm tracking-widest text-center [&_p]:font-secondary border-0 data-[active=true]:border border-green-100 disabled:text-green-300",
    },
    size: {
      md: "size-20",
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
      className={actionVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </Button>
  );
};
