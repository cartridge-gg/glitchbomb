import { cva, type VariantProps } from "class-variance-authority";
import { Dot } from "@/components/elements/dot";
import type { Orb } from "@/models/orb";

export interface RecentPullsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof recentPullsVariants> {
  orbs: Orb[];
}

const recentPullsVariants = cva(
  "relative flex justify-between items-center gap-4 rounded-full px-5 py-2 h-10",
  {
    variants: {
      variant: {
        default: "border border-green-950 bg-black-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const RecentPulls = ({
  orbs,
  variant,
  className,
  ...props
}: RecentPullsProps) => {
  // Prepare array with empty dots first, then filled dots
  const totalDots = 3;
  const displayOrbs = orbs.slice(0, totalDots);
  const emptyDotsCount = Math.max(0, totalDots - displayOrbs.length);

  return (
    <div className={recentPullsVariants({ variant, className })} {...props}>
      <p className="text-primary font-secondary uppercase text-2xs tracking-widest">
        Recent
      </p>
      <div className="flex gap-2">
        {/* Empty dots first */}
        {Array.from({ length: emptyDotsCount }).map((_, index) => {
          const key = `empty-${index}`;
          return <Dot key={key} size="md" />;
        })}
        {/* Then orb dots */}
        {displayOrbs.map((orb, index) => {
          const key = `orb-${index}`;
          return <Dot key={key} size="md" variant={orb.variant()} />;
        })}
      </div>
    </div>
  );
};
