import { cn } from "@/lib/utils";

const rarityColors = {
  common: { border: "rgba(34, 197, 94, 0.3)", text: "#4ade80" },
  rare: { border: "rgba(96, 165, 250, 0.3)", text: "#93c5fd" },
  cosmic: { border: "rgba(192, 132, 252, 0.5)", text: "#d8b4fe" },
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
  const isCosmic = rarity === "cosmic";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2 font-secondary text-2xs tracking-wider uppercase border-2",
        className,
      )}
      style={{
        borderColor: colors.border,
        color: isCosmic ? undefined : colors.text,
        background: isCosmic
          ? "linear-gradient(90deg, #a855f7, #7c3aed, #a855f7)"
          : undefined,
        backgroundSize: isCosmic ? "200% 100%" : undefined,
        WebkitBackgroundClip: isCosmic ? "text" : undefined,
        WebkitTextFillColor: isCosmic ? "transparent" : undefined,
        animation: isCosmic ? "cosmicWave 2s ease-in-out infinite" : undefined,
      }}
      {...props}
    >
      <style>
        {`
          @keyframes cosmicWave {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}
      </style>
      {rarity}
    </div>
  );
};
