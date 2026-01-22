import type { ReactNode } from "react";

export type InfoCardVariant = "green" | "red" | "yellow";

const variantStyles: Record<
  InfoCardVariant,
  { cardBg: string; innerBg: string; textColor: string }
> = {
  green: {
    cardBg: "#00FF0010",
    innerBg: "#00200025",
    textColor: "text-green-400",
  },
  red: {
    cardBg: "#FF1E0012",
    innerBg: "#10000030",
    textColor: "text-red-100",
  },
  yellow: {
    cardBg: "#FFD70010",
    innerBg: "#20180025",
    textColor: "text-yellow-400",
  },
};

export interface InfoCardProps {
  variant: InfoCardVariant;
  label?: string;
  children: ReactNode;
  className?: string;
}

export const InfoCard = ({
  variant,
  label,
  children,
  className = "",
}: InfoCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: styles.cardBg }}
    >
      {label && (
        <span
          className={`${styles.textColor} font-secondary text-sm tracking-[0.4em] uppercase`}
        >
          {label}
        </span>
      )}

      {/* Inner card - dark */}
      <div
        className="flex flex-col items-center justify-center gap-3 w-full rounded-lg py-6 px-4"
        style={{ backgroundColor: styles.innerBg }}
      >
        {children}
      </div>
    </div>
  );
};
