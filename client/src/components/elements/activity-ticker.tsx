import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityItem } from "@/hooks/activity-feed";
import { mobilePath } from "@/utils/mobile";

interface ActivityTickerProps {
  items: ActivityItem[];
}

const pillStyle = { backgroundColor: "rgba(255, 255, 255, 0.04)" };

function formatItem(item: ActivityItem): React.ReactNode {
  switch (item.type) {
    case "game_started":
      return (
        <>
          <span
            className="rounded px-2 py-0.5 text-green-400 font-bold font-glitch text-sm"
            style={pillStyle}
          >
            {item.username}
          </span>
          <span className="text-white font-secondary">started a</span>
          <span
            className="rounded px-2 py-0.5 text-yellow-400 font-bold font-glitch text-sm"
            style={pillStyle}
          >
            {item.stake}X
          </span>
          <span className="text-white font-secondary">game</span>
        </>
      );
    case "cash_out":
      return (
        <>
          <span
            className="rounded px-2 py-0.5 text-green-400 font-bold font-glitch text-sm"
            style={pillStyle}
          >
            {item.username}
          </span>
          <span className="text-white font-secondary">cashed out</span>
          <span
            className="rounded px-2 py-0.5 text-yellow-400 font-bold font-glitch text-sm"
            style={pillStyle}
          >
            {item.moonrocks}
          </span>
          <span className="text-white font-secondary">moonrocks</span>
        </>
      );
  }
}

export function ActivityTicker({ items }: ActivityTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
    target: null as HTMLElement | null,
  });
  const navigate = useNavigate();

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const matrix = new DOMMatrix(getComputedStyle(track).transform);
    track.style.animationPlayState = "paused";
    track.style.transform = `translateX(${matrix.m41}px)`;
    track.style.animation = "none";
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: matrix.m41,
      dragged: false,
      target: e.target as HTMLElement,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active || !trackRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.dragged = true;
    trackRef.current.style.transform = `translateX(${dragRef.current.scrollLeft + dx}px)`;
  }, []);

  const onPointerUp = useCallback(() => {
    const { dragged, target } = dragRef.current;
    dragRef.current.active = false;
    const track = trackRef.current;
    if (!track) return;

    // Navigate if it was a tap, not a drag
    if (!dragged && target) {
      const item = target.closest<HTMLElement>("[data-game-id]");
      if (item) {
        navigate(mobilePath(`/play?game=${item.dataset.gameId}&view=true`));
      }
    }

    // Calculate current position as a fraction of the animation cycle
    // Animation moves from translateX(0) to translateX(-50%)
    const currentX = Number.parseFloat(
      track.style.transform.replace(/[^-\d.]/g, "") || "0",
    );
    const halfWidth = track.scrollWidth / 2;
    // progress 0..1 through the cycle
    const progress = halfWidth > 0 ? (-currentX % halfWidth) / halfWidth : 0;
    const dur = Number.parseFloat(
      getComputedStyle(track).getPropertyValue("--ticker-duration") || "1",
    );
    // Resume animation from current position via negative delay
    track.style.transform = "";
    track.style.animation = "none";
    // Force reflow so the animation restarts
    void track.offsetWidth;
    track.style.animation = "";
    track.style.animationDelay = `-${progress * dur}s`;
  }, [navigate]);

  const minPerCopy =
    items.length > 0 ? Math.max(1, Math.ceil(8 / items.length)) : 0;
  const oneCopy =
    items.length > 0
      ? Array.from({ length: minPerCopy }, () => items).flat()
      : [];
  const duration = oneCopy.length * 6;

  return (
    <div
      className="ticker-container w-full overflow-hidden shrink-0 mb-4 flex items-center select-none touch-pan-x"
      style={{ backgroundColor: "rgba(4, 6, 3, 0.64)", height: 36 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {oneCopy.length > 0 && (
        <div
          ref={trackRef}
          className="ticker-track inline-flex whitespace-nowrap items-center h-full"
          style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
        >
          {[0, 1].map((copy) =>
            oneCopy.map((item, i) => (
              <span
                key={`${copy}-${item.id}-${i}`}
                className="inline-flex items-center gap-2 font-secondary text-xs tracking-wide cursor-pointer transition-opacity hover:opacity-50"
                data-game-id={item.gameId}
              >
                {(copy > 0 || i > 0) && (
                  <span className="w-1 h-1 rounded-full shrink-0 bg-white ml-3 mr-1" />
                )}
                {formatItem(item)}
              </span>
            )),
          )}
        </div>
      )}
    </div>
  );
}
