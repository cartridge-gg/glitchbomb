import { cva, type VariantProps } from "class-variance-authority";
import { ControllerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface ProfileProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof profileVariants> {}

const profileVariants = cva("p-0 has-[>svg]:p-0", {
  variants: {
    variant: {
      default: "text-primary-100",
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

export const Profile = ({
  variant,
  size,
  className,
  ...props
}: ProfileProps) => {
  return (
    <Button
      className={profileVariants({ variant, size, className })}
      variant="secondary"
      {...props}
    >
      <ControllerIcon size="md" />
    </Button>
  );
};
