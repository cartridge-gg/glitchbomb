import * as React from "react";
import { cn } from "@/lib/utils";

export type GradientColor =
  | "green"
  | "blue"
  | "orange"
  | "purple"
  | "yellow"
  | "red"
  | "none";

const gradientColors: Record<GradientColor, string> = {
  green: "linear-gradient(180deg, #35F81840 0%, #36F81800 100%)",
  blue: "linear-gradient(180deg, #60A5FA40 0%, #60A5FA00 100%)",
  orange: "linear-gradient(180deg, #FB923C40 0%, #FB923C00 100%)",
  purple:
    "linear-gradient(180deg, rgba(89, 31, 255, 0.3) 0%, rgba(89, 31, 255, 0.00) 100%)",
  yellow: "linear-gradient(180deg, #FACC1540 0%, #FACC1500 100%)",
  red: "linear-gradient(180deg, #EF444440 0%, #EF444400 100%)",
  none: "transparent",
};

export interface GradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: GradientColor;
}

export const GradientBorder = React.forwardRef<
  HTMLDivElement,
  GradientBorderProps
>(({ color = "green", className, style, children, ...props }, ref) => {
  if (color === "none") {
    return <>{children}</>;
  }

  return (
    <div
      ref={ref}
      className={cn("rounded-lg p-[1px]", className)}
      style={{
        background: gradientColors[color],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

GradientBorder.displayName = "GradientBorder";
