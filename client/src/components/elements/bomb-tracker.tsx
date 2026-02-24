import { cva, type VariantProps } from "class-variance-authority";
import { Bomb1xIcon, Bomb2xIcon, Bomb3xIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface BombDetail {
  total: number;
  count: number;
}

export interface BombDetails {
  simple: BombDetail;
  double: BombDetail;
  triple: BombDetail;
}

export interface BombTrackerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bombTrackerVariants> {
  details: BombDetails;
}

const bombTrackerVariants = cva(
  "select-none flex items-center w-full gap-[1px]",
  {
    variants: {
      variant: {
        default: "text-red-400",
      },
      size: {
        md: "h-10",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const BombTracker = ({
  details,
  variant,
  size,
  className,
  ...props
}: BombTrackerProps) => {
  const minSlots = 8;
  let keyCounter = 0;
  const slotClasses = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const emptySlotClasses = size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const slots: Array<{
    variant: "simple" | "double" | "triple";
    enabled: boolean;
    isPadding?: boolean;
  }> = [];

  const pushSlots = (
    detail: BombDetail,
    variant: "simple" | "double" | "triple",
  ) => {
    for (let index = 0; index < detail.total; index += 1) {
      const enabled = index >= detail.total - detail.count;
      slots.push({ variant, enabled, isPadding: false });
    }
  };

  pushSlots(details.simple, "simple");
  pushSlots(details.double, "double");
  pushSlots(details.triple, "triple");
  const targetSlots = Math.max(minSlots, slots.length);
  const padCount = targetSlots - slots.length;
  if (padCount > 0) {
    const padStart = Math.floor(padCount / 2);
    const padEnd = padCount - padStart;
    const emptySlot = {
      variant: "simple" as const,
      enabled: false,
      isPadding: true,
    };
    slots.unshift(...Array.from({ length: padStart }, () => emptySlot));
    slots.push(...Array.from({ length: padEnd }, () => emptySlot));
  }

  const EmptySlot = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.42857 0V1.71429H1.71429V3.42857H0V8.57143H1.71429V10.2857H3.42857V12H8.57143V10.2857H10.2857V8.57143H12V3.42857H10.2857V1.71429H8.57143V0H3.42857ZM8.57143 1.71429V3.42857H10.2857V8.57143H8.57143V10.2857H3.42857V8.57143H1.71429V3.42857H3.42857V1.71429H8.57143Z"
        fill="#FF1E00"
        fillOpacity="0.24"
      />
    </svg>
  );

  return (
    <div
      className={bombTrackerVariants({ variant, size, className })}
      {...props}
    >
      {slots.map((slot) => {
        const key = `bomb-${keyCounter++}`;
        const Icon =
          slot.variant === "simple"
            ? Bomb1xIcon
            : slot.variant === "double"
              ? Bomb2xIcon
              : Bomb3xIcon;

        return (
          <div key={key} className="flex-1 min-w-0 flex justify-center">
            {slot.isPadding ? (
              <EmptySlot className={emptySlotClasses} />
            ) : slot.enabled ? (
              <Icon
                className={cn("transition-opacity duration-300", slotClasses)}
              />
            ) : (
              <Icon
                className={cn(
                  "transition-opacity duration-300 opacity-25",
                  slotClasses,
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
