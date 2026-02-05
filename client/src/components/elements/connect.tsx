import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

export interface ConnectProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof connectVariants> {
  highlight?: boolean;
}

const connectVariants = cva("", {
  variants: {
    variant: {
      default:
        "font-secondary uppercase text-sm tracking-widest font-normal border-0",
    },
    size: {
      md: "h-12 w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Connect = ({
  highlight,
  variant,
  size,
  className,
  ...props
}: ConnectProps) => {
  return (
    <Button
      className={connectVariants({ variant, size, className })}
      variant={highlight ? "default" : "secondary"}
      {...props}
    >
      Login
    </Button>
  );
};
