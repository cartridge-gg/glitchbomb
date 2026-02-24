import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChipIcon } from "../icons";
import { Button } from "../ui/button";
import { Orb } from "./orb";

const itemVariants = cva(
  "select-none flex justify-between items-center gap-3 px-3 py-4 rounded-lg bg-green-gradient-100 border border-green-950",
  {
    variants: {
      variant: {
        default: "",
        bomb: "",
        point: "",
        multiplier: "",
        chip: "",
        moonrock: "",
        health: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ItemProps
  extends Omit<HTMLMotionProps<"div">, "ref">,
    VariantProps<typeof itemVariants> {
  title: string;
  description: string;
  cost: number;
  quantity?: number;
  canIncrement?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onAdd: () => void;
  onRemove?: () => void;
}

// Color mapping for variants
const VARIANT_COLORS = {
  default: {
    cssVar: "#ffffff",
  },
  bomb: {
    cssVar: "var(--red-100)",
  },
  point: {
    cssVar: "var(--green-400)",
  },
  multiplier: {
    cssVar: "var(--yellow-100)",
  },
  chip: {
    cssVar: "var(--orange-100)",
  },
  moonrock: {
    cssVar: "var(--blue-100)",
  },
  health: {
    cssVar: "var(--salmon-100)",
  },
} as const;

export const Item = ({
  title,
  description,
  cost,
  quantity = 0,
  canIncrement = true,
  disabled,
  onAdd,
  onRemove,
  variant,
  className,
  onClick,
  ...props
}: ItemProps) => {
  const isClickable = !!onClick;
  const hasQuantity = quantity > 0;

  return (
    <motion.div
      className={cn(
        itemVariants({ variant, className }),
        disabled && !hasQuantity && "opacity-40",
        isClickable ? "cursor-pointer" : "",
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-h-12 min-w-12">
          <Orb
            variant={variant}
            className="scale-[0.2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              boxShadow: `0px 0px 64px 16px color-mix(in srgb, ${VARIANT_COLORS[variant ?? "default"].cssVar} 50%, transparent)`,
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-start gap-2.5">
            <h3 className="text-sm font-bold font-secondary uppercase text-white tracking-widest">
              {title}
            </h3>
            <ItemCost cost={cost} />
          </div>
          <p className="text-2xs text-white opacity-65 font-secondary tracking-wide">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          className="h-10 w-8"
          variant="secondary"
          disabled={!hasQuantity}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <span className="text-base font-secondary">−</span>
        </Button>
        <div className="w-8 h-10 flex items-center justify-center bg-green-950/50 rounded border border-green-900">
          <span className="text-sm font-bold font-secondary text-white">
            {quantity}
          </span>
        </div>
        <Button
          className="h-10 w-8"
          variant="secondary"
          disabled={disabled || !canIncrement}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <span className="text-base font-secondary">+</span>
        </Button>
      </div>
    </motion.div>
  );
};

const ItemCost = ({ cost }: { cost: number }) => {
  return (
    <div className="flex items-center border border-orange-100 text-orange-100 rounded pl-0.5 pr-[5px]">
      <ChipIcon size="xs" />
      <div className="flex items-center gap-0.5 -translate-y-px">
        <span className="text-[8px] font-secondary px-px">x</span>
        <strong className="text-2xs font-secondary">{cost}</strong>
      </div>
    </div>
  );
};
