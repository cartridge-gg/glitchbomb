import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { SpinnerIcon } from "@/components/icons";
import {
  GradientBorder,
  type GradientColor,
} from "@/components/ui/gradient-border";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-bold text-xl tracking-wide inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-green-950 hover:bg-green-900 text-primary rounded-lg",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        primary:
          "text-primary-100 bg-primary-600 rounded-lg hover:bg-primary-500 shadow-[inset_0_1px_0_0_var(--primary-600),inset_1px_0_0_0_var(--primary-700),inset_-1px_0_0_0_var(--primary-700)]",
        secondary:
          "text-primary-100 bg-primary-800 rounded-lg hover:bg-primary-700 shadow-[inset_0_1px_0_0_var(--primary-700),inset_1px_0_0_0_var(--primary-800),inset_-1px_0_0_0_var(--primary-800)]",
        tertiary:
          "text-tertiary-100 bg-tertiary-700 rounded-lg hover:bg-tertiary-600 shadow-[inset_0_1px_0_0_var(--tertiary-700),inset_1px_0_0_0_var(--tertiary-800),inset_-1px_0_0_0_var(--tertiary-800)]",
        destructive:
          "text-red-100 bg-red-700 rounded-lg hover:bg-red-600 shadow-[inset_0_1px_0_0_var(--red-700),inset_1px_0_0_0_var(--red-800),inset_-1px_0_0_0_var(--red-800)]",
        constructive:
          "text-yellow-100 bg-yellow-700 rounded-lg hover:bg-yellow-600 shadow-[inset_0_1px_0_0_var(--yellow-700),inset_1px_0_0_0_var(--yellow-800),inset_-1px_0_0_0_var(--yellow-800)]",
        informative:
          "text-yellow-100 bg-yellow-800 hover:bg-yellow-700 shadow-none rounded-lg",
        muted:
          "bg-primary-500 rounded-lg hover:bg-primary-400 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        md: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "min-h-12 min-w-12 md:min-w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  gradient?: GradientColor;
  wrapperClassName?: string;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      gradient,
      wrapperClassName,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const button = (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {loading ? <SpinnerIcon className="animate-spin" /> : children}
      </Comp>
    );

    if (gradient && gradient !== "none") {
      return (
        <GradientBorder color={gradient} className={wrapperClassName}>
          {button}
        </GradientBorder>
      );
    }

    return button;
  },
);

Button.displayName = "Button";
