import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const rarityPillVariants = cva(
  "flex items-center justify-center rounded px-[5px] text-2xs uppercase border",
  {
    variants: {
      variant: {
        common: "bg-green-100",
        rare: "",
        cosmic: "",
      },
    },
    defaultVariants: {
      variant: "common",
    },
  },
);

export interface RarityPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rarityPillVariants> {}

export const RarityPill = ({
  variant,
  className,
  ...props
}: RarityPillProps) => {
  return (
    <div className={cn(rarityPillVariants({ variant, className }))} {...props}>
      <p className="font-secondary">{variant ?? "common"}</p>
    </div>
  );
};
