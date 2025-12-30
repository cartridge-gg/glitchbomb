import { cva, type VariantProps } from "class-variance-authority";
import SlotCounter from "react-slot-counter";

export interface ScoreProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreVariants> {
  value: number;
}

const scoreVariants = cva("relative", {
  variants: {
    variant: {
      default:
        "text-green-100 font-[900] text-5xl tracking-tight flex items-center justify-center",
    },
    size: {
      md: "h-[41px]",
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
        filter: "drop-shadow(0px 0px 13px var(--green-300))",
        ...style,
      }}
      {...props}
    >
      <SlotCounter
        value={value}
        autoAnimationStart={false}
        useMonospaceWidth={true}
      />
    </div>
  );
};
