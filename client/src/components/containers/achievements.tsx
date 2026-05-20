import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import {
  AchievementCard,
  type AchievementCardProps,
  AchievementItem,
} from "@/components/elements";
import { cn } from "@/lib/utils";

export interface AchievementsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementsVariants> {
  achievements: (AchievementCardProps & { id: string })[];
  newAchievementIds?: Set<string>;
}

const achievementsVariants = cva(
  "flex flex-col gap-6 h-full w-full overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const renderGridPadding = (count: number) => {
  const mobilePad = (2 - (count % 2)) % 2;
  const desktopPad = (4 - (count % 4)) % 4;
  const baseArray = Array.from({ length: mobilePad }, (_, i) => i);
  const desktopArray = Array.from(
    { length: desktopPad - mobilePad },
    (_, i) => i,
  );
  return (
    <>
      {baseArray.map((index) => (
        <AchievementItem key={`pad-${index}`} />
      ))}
      {desktopArray.map((index) => (
        <AchievementItem key={`pad-d-${index}`} className="hidden md:flex" />
      ))}
    </>
  );
};

export const Achievements = ({
  achievements,
  newAchievementIds,
  variant,
  className,
  ...props
}: AchievementsProps) => {
  const earned = achievements.filter((a) => a.count >= a.total);
  const remaining = achievements
    .filter((a) => a.count < a.total)
    .sort(
      (a, b) =>
        (b.total > 0 ? b.count / b.total : 0) -
        (a.total > 0 ? a.count / a.total : 0),
    );

  const defaultSelected =
    remaining.length > 0
      ? achievements.indexOf(
          remaining.reduce((best, item) =>
            item.total > 0 && item.count / item.total > best.count / best.total
              ? item
              : best,
          ),
        )
      : 0;

  const [selected, setSelected] = useState(defaultSelected);
  const featured = achievements[selected];

  return (
    <div
      className={cn(achievementsVariants({ variant, className }))}
      {...props}
    >
      {featured && (
        <div className="flex w-full px-1">
          <AchievementCard
            key={selected}
            {...featured}
            variant={featured.count >= featured.total ? "complete" : "default"}
            className="w-full"
          />
        </div>
      )}

      <div
        className="flex flex-col gap-6 flex-1 h-full overflow-y-auto px-1 pb-2 md:pb-0"
        style={{ scrollbarWidth: "none" }}
      >
        {earned.length > 0 && (
          <AchievementSection title="Earned">
            {earned.map((item) => {
              const index = achievements.indexOf(item);
              return (
                <AchievementItem
                  key={item.id}
                  icon={item.icon}
                  name={item.title}
                  count={item.count}
                  total={item.total}
                  variant="complete"
                  selected={selected === index}
                  hidden={false}
                  isNew={newAchievementIds?.has(item.id)}
                  onClick={() => setSelected(index)}
                />
              );
            })}
            {renderGridPadding(earned.length)}
          </AchievementSection>
        )}

        {remaining.length > 0 && (
          <AchievementSection title="Remaining">
            {remaining.map((item) => {
              const index = achievements.indexOf(item);
              const isHidden = item.hidden || false;
              return (
                <AchievementItem
                  key={item.id}
                  icon={item.icon}
                  name={item.title}
                  count={item.count}
                  total={item.total}
                  variant="default"
                  selected={selected === index}
                  hidden={isHidden}
                  isNew={newAchievementIds?.has(item.id)}
                  onClick={() => {
                    if (isHidden) return;
                    setSelected(index);
                  }}
                />
              );
            })}
            {renderGridPadding(remaining.length)}
          </AchievementSection>
        )}
      </div>
    </div>
  );
};

const AchievementSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center p-1">
      <p className="font-secondary text-2xl/4 text-white-400">{title}</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
  </div>
);
