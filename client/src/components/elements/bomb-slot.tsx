import { cva, type VariantProps } from "class-variance-authority";
import {
  Bomb1xIcon,
  Bomb2xIcon,
  Bomb3xIcon,
  SlotIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const bombSlotVariants = cva(
  "select-none inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-white-600 data-[active=true]:text-white-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BombSlotProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof bombSlotVariants> {
  value: number;
  active?: boolean;
}

function getIcon(value: number) {
  switch (value) {
    case 1:
      return Bomb1xIcon;
    case 2:
      return Bomb2xIcon;
    case 3:
      return Bomb3xIcon;
    default:
      return SlotIcon;
  }
}

export const BombSlot = ({
  value,
  active = false,
  variant,
  className,
  ...props
}: BombSlotProps) => {
  const Icon = getIcon(value);
  return (
    <div
      data-active={active && !!value}
      className={cn(
        bombSlotVariants({
          variant: variant,
          className,
        }),
      )}
      {...props}
    >
      <Icon size="lg*" />
    </div>
  );
};
