import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";

const orbIconVariants = cva(
  "relative rounded-full flex items-center justify-center border",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        md: "w-12 h-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface OrbIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof orbIconVariants> {
  orb: Orb;
}

export const OrbIcon = ({
  orb,
  size = "md",
  className,
  style,
  ...props
}: OrbIconProps) => {
  const Icon = orb.getIcon();
  return (
    <div
      className={cn(orbIconVariants({ size, className }))}
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
        className="absolute top-0 right-0 rounded-full p-1 -translate-y-1/2"
        style={{ backgroundColor: orb.color() }}
      >
        <p className="font-secondary text-black-200 text-sm leading-[8px] tracking-tighter">
          {orb.label()}
        </p>
      </div>
    </div>
  );
};
