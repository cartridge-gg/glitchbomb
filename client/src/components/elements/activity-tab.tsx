import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface ActivityTabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof activityTabVariants> {
  active?: boolean;
}

const activityTabVariants = cva(
  "flex justify-center items-center whitespace-nowrap select-none cursor-pointer data-[active=true]:pointer-events-none p-2 transition-colors",
  {
    variants: {
      variant: {
        default:
          "px-3 text-primary-400 bg-green-900 hover:text-primary-300 hover:bg-green-800 shadow-none data-[active=true]:text-primary-100 data-[active=true]:bg-primary-800 data-[active=true]:shadow-[inset_0_1px_0_0_var(--primary-700),inset_1px_0_0_0_var(--primary-800),inset_-1px_0_0_0_var(--primary-800)]",
      },
      size: {
        md: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const ActivityTab = ({
  variant,
  size,
  className,
  children,
  active = false,
  ...props
}: ActivityTabProps) => {
  return (
    <Button
      variant="secondary"
      data-active={active}
      className={cn(activityTabVariants({ variant, size, className }))}
      {...props}
    >
      <p className="font-secondary text-[22px]/[15px] px-0.5">{children}</p>
    </Button>
  );
};
