import { cva, type VariantProps } from "class-variance-authority";
import { ControllerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface ProfileProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof profileVariants> {
  username: string;
  highlight?: boolean;
}

const profileVariants = cva("gap-2", {
  variants: {
    variant: {
      default: "",
      secondary: "bg-green-950 hover:bg-green-900 border-0",
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

export const Profile = ({
  username,
  highlight,
  variant,
  size,
  className,
  ...props
}: ProfileProps) => {
  return (
    <Button
      className={profileVariants({ variant, size, className })}
      variant={highlight ? "default" : "secondary"}
      {...props}
    >
      <ControllerIcon size="sm" />
      <span className="truncate font-secondary uppercase text-sm tracking-widest font-normal">
        {username}
      </span>
    </Button>
  );
};
