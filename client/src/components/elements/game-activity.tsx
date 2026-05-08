import { cva, type VariantProps } from "class-variance-authority";
import { MoonrockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

export interface GameActivityProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof gameActivityVariants> {
  gameId: string;
  moonrocks: number;
  multiplier: number;
  payout: string;
  to: string;
  onClick?: () => void;
}

const gameActivityVariants = cva(
  "h-10 w-full flex items-center gap-2 px-3 rounded-lg",
  {
    variants: {
      variant: {
        default: "text-primary-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const getColors = (multiplier: number) => {
  if (multiplier >= 10) {
    return { bg: "bg-salmon-700 hover:bg-salmon-800", text: "text-salmon-100" };
  } else if (multiplier >= 8) {
    return { bg: "bg-red-700 hover:bg-red-800", text: "text-red-100" };
  } else if (multiplier >= 6) {
    return { bg: "bg-orange-700 hover:bg-orange-800", text: "text-orange-100" };
  } else if (multiplier >= 4) {
    return { bg: "bg-yellow-700 hover:bg-yellow-800", text: "text-yellow-100" };
  } else if (multiplier >= 2) {
    return { bg: "bg-blue-700 hover:bg-blue-800", text: "text-blue-100" };
  } else {
    return { bg: "bg-green-700 hover:bg-green-800", text: "text-green-100" };
  }
};

export const GameActivity = ({
  gameId,
  payout,
  moonrocks,
  multiplier,
  variant,
  to,
  onClick,
  className,
  ...props
}: GameActivityProps) => {
  const { bg: bgColor, text: multiplierColor } = getColors(multiplier);
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(gameActivityVariants({ variant, className }), bgColor)}
    >
      <Link to={to} className="w-full flex gap-2" {...props}>
        {/* Score column */}
        <div className="flex-[2] flex items-center gap-2 text-left">
          <div className="flex items-center gap-0.5 text-yellow-100">
            <div className="flex-shrink-0 flex items-center justify-center">
              <MoonrockIcon size="sm" />
            </div>
            <span className="font-secondary text-xl/5">{moonrocks}</span>
          </div>
        </div>

        {/* Game Id column */}
        <span className="flex-[6] font-secondary text-xl/5 text-white-100 truncate text-left">
          {gameId}
        </span>

        {/* Multiplier column */}
        <span
          className={cn(
            "flex-[1] font-secondary text-xl/5 text-white-100 truncate text-left",
            multiplierColor,
          )}
        >
          {`${multiplier.toFixed(0)}x`}
        </span>

        {/* Payout column */}
        <span className="flex-[2] font-secondary text-xl/5 truncate text-right">
          {payout}
        </span>
      </Link>
    </Button>
  );
};
