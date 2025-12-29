import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion } from "framer-motion";
import { DotIcon, HeartIcon, OrbIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export const pullerVariants = cva(
  "relative flex items-center justify-center rounded-full overflow-hidden cursor-pointer outline-none border-none",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        md: "w-[166px] h-[166px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface PullerProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof pullerVariants> {
  orbs?: number;
  lives?: number;
}

export const Puller = ({
  variant,
  size,
  className,
  orbs = 0,
  lives = 0,
  ...props
}: PullerProps) => {
  return (
    <motion.button
      className={cn(pullerVariants({ variant, size, className }))}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...props}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* 1. Image orb.png avec zoom pour couper les bords */}
        <motion.div
          className="absolute inset-0 rounded-full bg-center"
          style={{
            backgroundImage: "url(/assets/orb.png)",
            backgroundSize: "102%",
            backgroundPosition: "center",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />

        {/* 3. Glass filter */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        />

        {/* 4. Glass specular */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "inset 1px 1px 1px rgba(255, 255, 255, 0.2)",
          }}
        />
      </div>

      {/* 5. Content */}
      <div className="relative z-10 bg-transparent flex flex-col items-center gap-2.5 pt-4">
        <p
          className="text-white text-center text-[32px]/[28px] font-[900]"
          style={{
            filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))",
          }}
        >
          PULL
          <br />
          ORB
        </p>
        <div className="flex items-center justify-center text-white">
          <div
            className={cn(
              "flex items-center justify-center translate-x-[-4px]",
              orbs === 0 && "hidden",
            )}
          >
            <OrbIcon size="md" />
            <p className="text-xs font-secondary uppercase">{`x ${orbs}`}</p>
          </div>
          <DotIcon
            size="3xs"
            className={cn(
              "text-white opacity-25",
              (orbs === 0 || lives === 0) && "hidden",
            )}
          />
          <div
            className={cn(
              "flex items-center justify-center translate-x-[-4px]",
              lives === 0 && "hidden",
            )}
          >
            <HeartIcon size="md" />
            <p className="text-xs font-secondary uppercase">{`x ${lives}`}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
