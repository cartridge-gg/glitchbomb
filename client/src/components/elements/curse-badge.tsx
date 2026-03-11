import { FireIcon } from "@/components/icons";
import { Multiplier } from "./multiplier";

export interface CurseBadgeProps {
  size: number;
}

const CURSE_GRADIENT = "linear-gradient(180deg, #F89149CC 0%, #D10D07CC 100%)";
const CURSE_BORDER_GRADIENT =
  "linear-gradient(180deg, #F89149 0%, #D10D07 100%)";
const CURSE_COLOR = "#F89149";

export const CurseBadge = ({ size }: CurseBadgeProps) => {
  const iconSize = Math.round(size * 0.4);

  return (
    <div style={{ width: size, height: size }}>
      <Multiplier
        count={3}
        cornerRadius={50}
        className="h-full w-full"
        electricGradient={CURSE_GRADIENT}
        electricBorderGradient={CURSE_BORDER_GRADIENT}
        electricColor={CURSE_COLOR}
        contentOpacity={0.55}
        borderWidthMin={1.25}
        borderWidthMax={2.5}
      >
        <FireIcon style={{ width: iconSize, height: iconSize }} />
      </Multiplier>
    </div>
  );
};
