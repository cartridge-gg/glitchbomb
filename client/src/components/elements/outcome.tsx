import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const outcomeVariants = cva("select-none uppercase relative text-center", {
  variants: {
    variant: {
      default: "whitespace-nowrap",
      bomb: "whitespace-nowrap",
      point: "whitespace-nowrap",
      multiplier: "whitespace-nowrap",
      health: "whitespace-nowrap",
      chip: "break-words",
      moonrock: "break-words",
    },
    size: {
      sm: "text-xl leading-tight tracking-tight",
      md: "text-4xl leading-tight tracking-tighter",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const textColorVariants = (variant: string) => {
  switch (variant) {
    case "bomb":
      return "text-white/25";
    case "point":
      return "text-green-900";
    case "multiplier":
      return "text-orb-multiplier-faded";
    case "health":
      return "text-orb-heart-faded";
    case "chip":
      return "text-orb-chips-faded";
    case "moonrock":
      return "text-orb-moonrock-faded";
    default:
      return "text-green-900";
  }
};

const backgroundVariants = (variant: string) => {
  switch (variant) {
    case "bomb":
      return "var(--hp-gradient-100)";
    case "point":
      return "var(--point-gradient-100)";
    case "multiplier":
      return "var(--multiplier-gradient-100)";
    case "health":
      return "var(--hp-gradient-100)";
    case "chip":
      return "var(--chip-gradient-100)";
    case "moonrock":
      return "var(--moonrock-gradient-100)";
    default:
      return "var(--point-gradient-100)";
  }
};

export interface OutcomeProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof outcomeVariants> {
  content: string;
}

export const Outcome = ({
  content,
  variant,
  size,
  className,
  ...props
}: OutcomeProps) => {
  const strokeWidth = size === "sm" ? "6px" : "12px";
  return (
    <motion.div
      className={cn(outcomeVariants({ variant, size, className }), "")}
      style={{
        boxShadow: "0px 0px 256px 128px #000000DD",
      }}
      {...props}
    >
      {/* Stroke layer with gradient */}
      <p
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3"
        style={{
          backgroundImage: backgroundVariants(variant ?? "default"),
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: `${strokeWidth} transparent`,
          paintOrder: "stroke fill",
        }}
        aria-hidden="true"
      >
        {content}
      </p>
      {/* Text layer */}
      <p
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black",
        )}
      >
        {content}
      </p>
      <p
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          textColorVariants(variant ?? "default"),
        )}
      >
        {content}
      </p>
    </motion.div>
  );
};
