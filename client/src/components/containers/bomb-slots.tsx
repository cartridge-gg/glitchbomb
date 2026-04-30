import { cva, type VariantProps } from "class-variance-authority";
import { BombSlot } from "@/components/elements/bomb-slot";
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

const bombSlotsVariants = cva("select-none flex items-center w-full gap-2", {
  variants: {
    variant: {
      default: "bg-black-100 rounded-lg px-4 py-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BombSlotsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bombSlotsVariants> {
  details: BombDetails;
}

const MIN_SLOTS = 7;

type Slot = {
  value: number;
  active: boolean;
  empty: boolean;
};

const buildSlots = (details: BombDetails): Slot[] => {
  const slots: Slot[] = [];

  const push = (detail: BombDetail, value: number) => {
    for (let index = 0; index < detail.total; index += 1) {
      const active = index >= detail.total - detail.count;
      slots.push({ value, active, empty: false });
    }
  };

  push(details.simple, 1);
  push(details.double, 2);
  push(details.triple, 3);

  const target = Math.max(MIN_SLOTS, slots.length);
  const padCount = target - slots.length;
  if (padCount > 0) {
    const padStart = Math.floor(padCount / 2);
    const padEnd = padCount - padStart;
    const emptySlot: Slot = { value: 0, active: false, empty: true };
    slots.unshift(...Array.from({ length: padStart }, () => emptySlot));
    slots.push(...Array.from({ length: padEnd }, () => emptySlot));
  }

  return slots;
};

export const BombSlots = ({
  details,
  variant,
  className,
  ...props
}: BombSlotsProps) => {
  const slots = buildSlots(details);

  return (
    <div className={cn(bombSlotsVariants({ variant, className }))} {...props}>
      {slots.map((slot, index) => {
        const key = `bomb-${index}`;
        return (
          <div key={key} className="flex-1 min-w-0 flex justify-center">
            <BombSlot
              value={slot.value}
              active={slot.active}
              empty={slot.empty}
            />
          </div>
        );
      })}
    </div>
  );
};
