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
  payout: string;
  to: string;
  onClick?: () => void;
}

const gameActivityVariants = cva(
  "h-10 w-full flex items-center gap-2 px-3 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-green-800 hover:bg-green-900 text-green-100",
        glitched: "bg-salmon-800 hover:bg-salmon-900 text-salmon-100",
        expired: "bg-yellow-800 hover:bg-yellow-900 text-yellow-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameActivity = ({
  gameId,
  payout,
  moonrocks,
  variant,
  to,
  onClick,
  className,
  ...props
}: GameActivityProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(gameActivityVariants({ variant, className }))}
    >
      <Link to={to} className="w-full flex gap-2" {...props}>
        {/* Score column */}
        <div className="flex-[1] flex items-center gap-2 text-left">
          <div className="flex items-center gap-0.5 text-yellow-100">
            <div className="flex-shrink-0 flex items-center justify-center">
              <MoonrockIcon size="sm" />
            </div>
            <span className="font-secondary text-xl/5">{moonrocks}</span>
          </div>
        </div>

        {/* Game Id column */}
        <span className="flex-[2] font-secondary text-xl/5 text-white-100 truncate text-left">
          {gameId}
        </span>

        {/* Payout column */}
        <span className="flex-[1] font-secondary text-xl/5 truncate text-right">
          {payout}
        </span>
      </Link>
    </Button>
  );
};
