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
        <TooltipContent className="bg-black border border-white/10 px-3 py-2 max-w-[200px]">
          <p
            className="font-secondary text-xs font-bold"
            style={{ color: orb.color() }}
          >
            {orb.name()}
          </p>
          <p
            className="font-secondary text-xs mt-0.5 opacity-50"
            style={{ color: orb.color() }}
          >
            {orb.description()}
          </p>
        </TooltipContent>
      </TapTooltip>
    </div>
  );
};
