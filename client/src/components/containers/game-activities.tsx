import { cva, type VariantProps } from "class-variance-authority";
import { useMemo, useRef } from "react";
import {
  GameActivity,
  type GameActivityProps,
} from "@/components/elements/game-activity";
import { cn } from "@/lib/utils";
import { ActivityTab } from "../elements";

export type ActivityFilter = "all" | "mine";

export interface GameActivitiesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof gameActivitiesVariants> {
  activities: Array<GameActivityProps & { timestamp: number }>;
  filter?: ActivityFilter;
  onFilterChange?: (filter: ActivityFilter) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const gameActivitiesVariants = cva(
  "select-none relative w-full flex flex-col gap-4",
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

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}-${day}, ${year}`;
};

const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (timestamp: number): boolean => {
  const date = new Date(timestamp * 1000);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

type ActivityItem = GameActivitiesProps["activities"][0];

type Section = {
  title?: string;
  activities: ActivityItem[];
};

export const GameActivities = ({
  activities,
  filter = "all",
  onFilterChange,
  onLoadMore,
  hasMore = false,
  variant,
  className,
  ...props
}: GameActivitiesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element || !hasMore || !onLoadMore) return;

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distanceToBottom <= 100) {
      onLoadMore();
    }
  };

  const sections = useMemo<Section[]>(() => {
    const today: ActivityItem[] = [];
    const yesterday: ActivityItem[] = [];
    const otherMap = new Map<string, ActivityItem[]>();

    activities.forEach((activity) => {
      if (isToday(activity.timestamp)) {
        today.push(activity);
      } else if (isYesterday(activity.timestamp)) {
        yesterday.push(activity);
      } else {
        const dateStr = formatDate(activity.timestamp);
        if (!otherMap.has(dateStr)) {
          otherMap.set(dateStr, []);
        }
        otherMap.get(dateStr)?.push(activity);
      }
    });

    const sections: Section[] = [];

    // Today section (no title)
    if (today.length > 0) {
      sections.push({ activities: today });
    }

    // Yesterday section
    if (yesterday.length > 0) {
      sections.push({ title: "Yesterday", activities: yesterday });
    }

    // Other dates sections
    const other = Array.from(otherMap.entries())
      .map(([date, activities]) => ({ date, activities }))
      .sort((a, b) => {
        // Sort by timestamp descending (most recent first)
        const aTimestamp = a.activities[0]?.timestamp || 0;
        const bTimestamp = b.activities[0]?.timestamp || 0;
        return bTimestamp - aTimestamp;
      });

    other.forEach(({ date, activities }) => {
      sections.push({ title: date, activities });
    });

    return sections;
  }, [activities]);

  return (
    <div
      className={cn(gameActivitiesVariants({ variant, className }), "w-full")}
      {...props}
    >
      {/* Title */}
      <div className="min-h-8 flex justify-between items-center gap-6">
        <h2 className="text-2xl font-secondary text-primary-100 uppercase px-1">
          Activity
        </h2>
        <div className="flex gap-3">
          <ActivityTab
            active={filter === "all"}
            onClick={() => onFilterChange?.("all")}
            className="flex-1"
          >
            <span className="hidden md:block font-secondary">All Games</span>
            <span className="block md:hidden font-secondary">All</span>
          </ActivityTab>
          <ActivityTab
            active={filter === "mine"}
            onClick={() => onFilterChange?.("mine")}
            className="flex-1"
          >
            <span className="hidden md:block font-secondary">My Games</span>
            <span className="block md:hidden font-secondary">My</span>
          </ActivityTab>
        </div>
      </div>

      {/* Activities list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="grow bg-black-900 border-2 border-primary-800 rounded-xl flex flex-col p-4 gap-4 overflow-x-hidden overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {sections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-secondary text-primary-400 text-xl text-center">
              You have not played
              <br />
              any games yet
            </p>
          </div>
        ) : (
          sections.map((section, sectionIndex) => (
            <div
              key={section.title ?? `section-${sectionIndex}`}
              className="flex flex-col gap-4"
            >
              {section.title && (
                <h3 className="text-2xl text-primary-400 font-secondary uppercase">
                  {section.title}
                </h3>
              )}
              <div className="flex flex-col gap-3">
                {section.activities.map((activity) => (
                  <GameActivity
                    key={activity.to}
                    gameId={activity.gameId}
                    payout={activity.payout}
                    moonrocks={activity.moonrocks}
                    to={activity.to}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
