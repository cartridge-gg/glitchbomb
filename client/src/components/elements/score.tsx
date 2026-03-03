import { cva, type VariantProps } from "class-variance-authority";

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
  return (
    <div
      className={scoreVariants({ variant, size, className })}
      style={{
        filter: "drop-shadow(0px 0px 13px var(--green-900))",
        ...style,
      }}
      {...props}
    >
      <span className="font-primary">{value}</span>
    </div>
  );
};
