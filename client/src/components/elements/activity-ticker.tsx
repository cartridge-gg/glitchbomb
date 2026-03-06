import type { ActivityItem } from "@/hooks/activity-feed";

interface ActivityTickerProps {
  items: ActivityItem[];
}

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
  if (items.length === 0) return null;

  // Ensure each copy has enough items to fill the viewport width
  const minPerCopy = Math.max(1, Math.ceil(8 / items.length));
  const oneCopy = Array.from({ length: minPerCopy }, () => items).flat();
  const duration = oneCopy.length * 6;

  return (
    <div className="w-full overflow-hidden py-1.5">
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
              className="inline-flex items-center gap-1.5 mx-3 font-secondary text-[11px] tracking-wide"
            >
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    item.type === "game_started" ? "#22c55e" : "#FACC15",
                }}
              />
              {formatItem(item)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
