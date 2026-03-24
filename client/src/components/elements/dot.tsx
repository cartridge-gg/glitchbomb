import { cva, type VariantProps } from "class-variance-authority";
import { DotIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface DotProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotVariants> {}

const dotVariants = cva("select-none relative", {
  variants: {
    variant: {
      default: "text-green-900",
      green: "text-green-400",
      yellow: "text-orb-multiplier",
      orange: "text-orb-chips",
      red: "text-white",
      blue: "text-orb-moonrock",
      salmon: "text-orb-heart",
    },
    size: {
      md: "size-[15px]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Dot = ({
  variant,
  size,
  className,
  style,
  ...props
}: DotProps) => {
  // Map variant to CSS color variable
  const getColorVariable = () => {
    switch (variant) {
      case "green":
        return "var(--green-400)";
      case "yellow":
        return "var(--orb-multiplier)";
      case "orange":
        return "var(--orb-chips)";
      case "red":
        return "#FFFFFF";
      case "blue":
        return "var(--orb-moonrock)";
      case "salmon":
        return "var(--orb-heart)";
      default:
        return "";
    }
  };

  const colorVar = getColorVariable();

  return (
    <div
      className={cn(dotVariants({ variant, size, className }))}
      style={style}
      {...props}
    >
      <DotIcon
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35px] w-[35px]"
        style={{
          filter: colorVar
            ? `drop-shadow(0px 0px 10px color-mix(in srgb, ${colorVar} 70%, transparent))`
            : undefined,
        }}
      />
    </div>
  );
};
