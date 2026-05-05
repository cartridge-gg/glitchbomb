import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const rarityPillVariants = cva(
  "flex items-center justify-center rounded px-[5px] text-2xs uppercase border",
  {
    variants: {
      variant: {
        common: "text-green-100 border-green-600",
        rare: "text-blue-100 border-blue-600",
        cosmic:
          "bg-clip-text text-transparent bg-gradient-to-t from-blue-100 to-purple-100 border-purple-600",
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
      <p className="font-secondary text-base/4">{variant ?? "common"}</p>
    </div>
  );
};
