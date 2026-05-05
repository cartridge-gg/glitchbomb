import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";

const summaryItemVariants = cva(
  "relative rounded-full flex items-center justify-center border",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "w-10 h-10",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface SummaryItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof summaryItemVariants> {
  orb: Orb;
  quantity: number;
}

export const SummaryItem = ({
  orb,
  quantity,
  variant,
  size,
  className,
  style,
  ...props
}: SummaryItemProps) => {
  const Icon = orb.getCategoryIcon();
  return (
    <div
      className={cn(summaryItemVariants({ variant, size, className }))}
      style={{
        borderColor: orb.color(),
        ...style,
      }}
      {...props}
    >
      {/* Orb background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: "url(/assets/orb.png)",
          backgroundSize: "102%",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 60,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-5"
        style={{ backgroundColor: orb.color() }}
      />
      <Icon
        className={cn("relative", orb.isBomb() && "glitch-icon")}
        size={size}
        style={{
          color: orb.color(),
        }}
      />
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full p-1 translate-y-full border bg-black-100 px-1.5 py-[3px]"
        style={{ borderColor: orb.color(), color: orb.color() }}
      >
        <p className="text-sm leading-[8px]">
          <span className="font-secondary text-white-400">x</span>
          <span className="font-secondary">{quantity}</span>
        </p>
      </div>
    </div>
  );
};
