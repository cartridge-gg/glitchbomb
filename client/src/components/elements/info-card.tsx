import type { ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";

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
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const InfoCard = ({
  variant,
  label,
  children,
  className = "",
  onClick,
  disabled = false,
  isLoading = false,
}: InfoCardProps) => {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;
  const isDisabled = disabled || isLoading;

  const cardContent = (
    <>
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
        {isLoading ? <LoadingSpinner size="md" /> : children}
      </div>
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-200 ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:brightness-125 hover:scale-[1.02] active:scale-[0.98]"
        } ${className}`}
        style={{ backgroundColor: styles.cardBg }}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl p-4 ${className}`}
      style={{ backgroundColor: styles.cardBg }}
    >
      {cardContent}
    </div>
  );
};
