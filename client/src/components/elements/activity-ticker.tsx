import type { ActivityItem } from "@/hooks/activity-feed";

interface ActivityTickerProps {
  items: ActivityItem[];
}

const SEED_ITEMS: ActivityItem[] = [
  {
    id: "seed-1",
    type: "game_started",
    username: "Clicksave",
    stake: 1,
    timestamp: 0,
  },
  {
    id: "seed-2",
    type: "cash_out",
    username: "Bal7hazar",
    moonrocks: 120,
    timestamp: 0,
  },
  {
    id: "seed-3",
    type: "game_started",
    username: "Shinobi",
    stake: 5,
    timestamp: 0,
  },
  {
    id: "seed-4",
    type: "cash_out",
    username: "0xDev",
    moonrocks: 340,
    timestamp: 0,
  },
  {
    id: "seed-5",
    type: "game_started",
    username: "LordFelt",
    stake: 3,
    timestamp: 0,
  },
];

function formatItem(item: ActivityItem): React.ReactNode {
  switch (item.type) {
    case "game_started":
      return (
        <>
          <span className="text-green-400 font-bold">{item.username}</span>
          <span className="text-white/60"> started a </span>
          <span className="text-yellow-400 font-bold">{item.stake}X</span>
          <span className="text-white/60"> game</span>
        </>
      );
    case "cash_out":
      return (
        <>
          <span className="text-green-400 font-bold">{item.username}</span>
          <span className="text-white/60"> cashed out </span>
          <span className="text-yellow-400 font-bold">{item.moonrocks}</span>
          <span className="text-white/60"> moonrocks</span>
        </>
      );
  }
}

export function ActivityTicker({ items }: ActivityTickerProps) {
  // Use live items if available, otherwise show seed data
  const displayItems = items.length > 0 ? items : SEED_ITEMS;

  // Ensure each copy has enough items to fill the viewport width
  const minPerCopy = Math.max(1, Math.ceil(8 / displayItems.length));
  const oneCopy = Array.from({ length: minPerCopy }, () => displayItems).flat();
  const duration = oneCopy.length * 6;

  return (
    <div className="w-full overflow-hidden shrink-0 py-1.5 mb-2">
      <div
        className="inline-flex whitespace-nowrap items-center"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
        }}
      >
        {/* Two identical copies for seamless looping */}
        {[0, 1].map((copy) =>
          oneCopy.map((item, i) => (
            <span
              key={`${copy}-${item.id}-${i}`}
              className="inline-flex items-center font-secondary text-[11px] tracking-wide [&>span]:font-secondary"
            >
              <span className="w-1 h-1 rounded-full shrink-0 bg-white mx-3" />
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5">
                {formatItem(item)}
              </span>
            </span>
          )),
        )}
      </div>
    </div>
  );
}
