import { cn } from "@/lib/utils";

const rarityColors = {
  common: { border: "rgba(34, 197, 94, 0.3)", text: "#4ade80" },
  rare: { border: "rgba(96, 165, 250, 0.3)", text: "#93c5fd" },
  cosmic: { border: "rgba(192, 132, 252, 0.3)", text: "#d8b4fe" },
};

export interface RarityPillProps extends React.HTMLAttributes<HTMLDivElement> {
  rarity: "common" | "rare" | "cosmic";
}

export const RarityPill = ({
  rarity,
  className,
  ...props
}: RarityPillProps) => {
  const colors = rarityColors[rarity];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 font-secondary text-2xs tracking-wider uppercase border-2",
        className,
      )}
      style={{
        borderColor: colors.border,
        color: colors.text,
      }}
      {...props}
    >
      {rarity}
    </div>
  );
};
