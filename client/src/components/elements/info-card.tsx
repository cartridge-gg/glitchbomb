import type { ReactNode } from "react";
import {
  GradientBorder,
  type GradientColor,
} from "@/components/ui/gradient-border";
import { LoadingSpinner } from "./loading-spinner";

export type InfoCardVariant = "green" | "red" | "yellow" | "orange";

const variantStyles: Record<
  InfoCardVariant,
  {
    cardBg: string;
    innerBg: string;
    textColor: string;
    borderColor: GradientColor;
  }
> = {
  green: {
    cardBg: "#0A1A0A",
    innerBg: "rgba(0, 0, 0, 0.1)",
    textColor: "text-green-400",
    borderColor: "green",
  },
  red: {
    cardBg: "#1A0A0A",
    innerBg: "rgba(0, 0, 0, 0.1)",
    textColor: "text-red-100",
    borderColor: "red",
  },
  yellow: {
    cardBg: "#1A1A0A",
    innerBg: "rgba(0, 0, 0, 0.1)",
    textColor: "text-yellow-400",
    borderColor: "yellow",
  },
  orange: {
    cardBg: "#1A120A",
    innerBg: "rgba(0, 0, 0, 0.1)",
    textColor: "text-orange-400",
    borderColor: "orange",
  },
};

export interface InfoCardProps {
  variant: InfoCardVariant;
  label?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  labelClassName?: string;
  innerClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hideInner?: boolean;
}

export const InfoCard = ({
  variant,
  label,
  children,
  className = "",
  contentClassName = "",
  labelClassName = "",
  innerClassName = "",
  onClick,
  disabled = false,
  isLoading = false,
  hideInner = false,
}: InfoCardProps) => {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;
  const isDisabled = disabled || isLoading;

  const cardContent = (
    <>
      {label && (
        <span
          className={`${styles.textColor} font-secondary text-sm tracking-[0.4em] uppercase ${labelClassName}`}
        >
          {label}
        </span>
      )}

      {hideInner ? (
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-3 w-full ${innerClassName}`}
        >
          {isLoading ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
              <div className="opacity-0 w-full">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      ) : (
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-3 w-full rounded-lg py-6 px-4 ${innerClassName}`}
          style={{ backgroundColor: styles.innerBg }}
        >
          {isLoading ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
              <div className="opacity-0 w-full">{children}</div>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </>
  );

  if (isClickable) {
    return (
      <GradientBorder
        color={styles.borderColor}
        className={`rounded-2xl h-full ${className}`}
      >
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          className={`flex flex-col items-center gap-3 rounded-2xl p-4 w-full h-full transition-all duration-200 ${contentClassName} ${
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:brightness-125"
          }`}
          style={{ backgroundColor: styles.cardBg }}
        >
          {cardContent}
        </button>
      </GradientBorder>
    );
  }

  return (
    <GradientBorder
      color={styles.borderColor}
      className={`rounded-2xl h-full ${className}`}
    >
      <div
        className={`flex flex-col items-center gap-3 rounded-2xl p-4 h-full ${contentClassName}`}
        style={{ backgroundColor: styles.cardBg }}
      >
        {cardContent}
      </div>
    </GradientBorder>
  );
};
