import { cva, type VariantProps } from "class-variance-authority";
import {
  TapTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Orb } from "@/models";
import { OrbIcon } from "./orb-icon";

const bagItemVariants = cva("", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BagItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bagItemVariants> {
  orb: Orb;
  discarded?: boolean;
}

export const BagItem = ({
  orb,
  discarded = false,
  variant,
  className,
  ...props
}: BagItemProps) => {
  return (
    <div className={cn(bagItemVariants({ variant, className }))} {...props}>
      <TapTooltip>
        <TooltipTrigger asChild>
          <OrbIcon
            data-discarded={discarded}
            orb={orb}
            size="md"
            className="data-[discarded=true]:opacity-25"
          />
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-2 bg-black-100 border border-white-800 p-3 max-w-[200px]">
          <p
            className="font-secondary text-base/3 uppercase"
            style={{ color: orb.color() }}
          >
            {orb.name()}
          </p>
          <p
            className="font-secondary text-sm/3 opacity-80"
            style={{ color: orb.color() }}
          >
            {orb.description()}
          </p>
        </TooltipContent>
      </TapTooltip>
    </div>
  );
};
