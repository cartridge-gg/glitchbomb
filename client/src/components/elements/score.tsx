import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";

export interface ScoreProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreVariants> {
  value: number;
}

const scoreVariants = cva("relative", {
  variants: {
    variant: {
      default: "text-green-400 text-5xl flex items-center justify-center",
    },
    size: {
      md: "h-[41px] grow",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export const Score = ({
  value,
  variant,
  size,
  className,
  style,
  ...props
}: ScoreProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isGlitch, setIsGlitch] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      // Switch to glitch font
      setIsGlitch(true);

      // Update value after a short delay
      setTimeout(() => {
        setDisplayValue(value);

        // Return to normal font
        setTimeout(() => {
          setIsGlitch(false);
        }, 200);
      }, 100);
    }
  }, [value, displayValue]);

  return (
    <div
      className={scoreVariants({ variant, size, className })}
      style={{
        filter: "drop-shadow(0px 0px 13px var(--green-900))",
        ...style,
      }}
      {...props}
    >
      <span
        className={
          isGlitch
            ? "font-glitch -translate-y-[1.5px] scale-[1.01]"
            : "font-primary"
        }
      >
        {displayValue}
      </span>
    </div>
  );
};
