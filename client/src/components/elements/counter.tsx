import { cva, type VariantProps } from "class-variance-authority";
import SlotCounter from "react-slot-counter";
import { ChipIcon, MoonrockIcon } from "@/components/icons";

export interface CounterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof counterVariants> {
  balance: number;
}

const counterVariants = cva("relative", {
  variants: {
    variant: {
      moonrock: "text-blue-100",
      chip: "text-orange-100",
    },
    size: {
      md: "w-[21px] h-[41px]",
    },
  },
  defaultVariants: {
    variant: "moonrock",
    size: "md",
  },
});

export const Counter = ({
  balance,
  variant,
  size,
  className,
  ...props
}: CounterProps) => {
  const CounterIcon = variant === "moonrock" ? MoonrockIcon : ChipIcon;

  return (
    <div className={counterVariants({ variant, size, className })} {...props}>
      <CounterIcon className="absolute top-1/6 left-1/2 -translate-x-1/2 min-h-[21px] min-w-[21px]" />
      <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 text-base tracking-widest [&_span]:font-secondary pl-px">
        <SlotCounter
          value={balance}
          autoAnimationStart={false}
          useMonospaceWidth={true}
        />
      </div>
    </div>
  );
};
