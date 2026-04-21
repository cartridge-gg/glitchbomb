import { cva, type VariantProps } from "class-variance-authority";
import { CrossIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface CloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeVariants> {}

const closeVariants = cva(
  "flex items-center justify-center cursor-pointer text-green-100 hover:text-green-200 transition-colors p-0",
  {
    variants: {
      size: {
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const Close = ({ size, className, ...props }: CloseProps) => {
  return (
    <Button
      variant="ghost"
      className={closeVariants({ size, className })}
      {...props}
    >
      <CrossIcon size={size ?? "md"} />
    </Button>
  );
};
