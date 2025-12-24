import { cva, type VariantProps } from "class-variance-authority";
import { ControllerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface ConnectProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof connectVariants> {}

// eslint-disable-next-line react-refresh/only-export-components
export const connectVariants = cva("p-0 has-[>svg]:p-0", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      md: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Connect = ({
  variant,
  size,
  className,
  ...props
}: ConnectProps) => {
  return (
    <Button
      className={connectVariants({ variant, size, className })}
      variant="default"
      {...props}
    >
      <ControllerIcon size="md" />
    </Button>
  );
};
