import { cva, type VariantProps } from "class-variance-authority";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameCard } from "@/components/elements/game-card";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GameCardsGame {
  /** Falsy (0/undefined) marks the placeholder "new game" card. */
  gameId?: number;
  moonrocks?: number;
  /** Unix seconds; for the new card, set to now + 24h to display "24h". */
  expiration: number;
  payout: string;
}

export interface GameCardsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay">,
    VariantProps<typeof gameCardsVariants> {
  games: GameCardsGame[];
  gameId?: number;
  setGameId: (id: number) => void;
  loadingGameId: number | null;
  onPlay: (gameId: number) => void;
  onNewGame: () => void;
  onPractice: () => void;
  requireLogin: (action: () => void) => void;
}

const gameCardsVariants = cva("flex flex-col gap-4", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const NEW_GAME_ID = 0;
const SWIPE_DISTANCE_THRESHOLD = 0.2;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const DRAG_DETECTION_PX = 5;
const COUNTDOWN_TICK_MS = 60_000;

const formatExpiry = (expiration: number, now: number): string => {
  if (!expiration) return "24h";
  const remaining = expiration - now;
  if (remaining <= 0) return "EXPIRED";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const GameCards = ({
  games,
  gameId,
  setGameId,
  loadingGameId,
  onPlay,
  onNewGame,
  onPractice: _onPractice,
  requireLogin,
  variant,
  className,
  ...props
}: GameCardsProps) => {
  const totalSlides = games.length;
  const activeGameCount = useMemo(
    () => games.filter((g) => !!g.gameId).length,
    [games],
  );
  const newCardIndex = useMemo(() => {
    const idx = games.findIndex((g) => !g.gameId);
    return idx >= 0 ? idx : Math.max(0, games.length - 1);
  }, [games]);

  const activeGameIndex = useMemo(() => {
    if (!gameId) return newCardIndex;
    const idx = games.findIndex((g) => g.gameId === gameId);
    return idx >= 0 ? idx : newCardIndex;
  }, [gameId, games, newCardIndex]);

  const setIndex = useCallback(
    (idx: number) => {
      const target = games[idx];
      if (!target) return;
      setGameId(target.gameId ?? NEW_GAME_ID);
    },
    [games, setGameId],
  );

  const handlePrev = useCallback(() => {
    if (activeGameIndex <= 0) return;
    setIndex(activeGameIndex - 1);
  }, [activeGameIndex, setIndex]);

  const handleNext = useCallback(() => {
    if (activeGameIndex >= totalSlides - 1) return;
    setIndex(activeGameIndex + 1);
  }, [activeGameIndex, setIndex, totalSlides]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; time: number } | null>(null);
  const didDrag = useRef(false);

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const interval = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      COUNTDOWN_TICK_MS,
    );
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (totalSlides <= 1) return;
      setIsDragging(true);
      setDragOffset(0);
      didDrag.current = false;
      dragStart.current = { x: e.clientX, time: Date.now() };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [totalSlides],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > DRAG_DETECTION_PX) didDrag.current = true;
    setDragOffset(dx);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dt = Date.now() - dragStart.current.time;
      const velocity = Math.abs(dx) / dt;

      const containerWidth = carouselRef.current?.offsetWidth ?? 1;
      const threshold = containerWidth * SWIPE_DISTANCE_THRESHOLD;

      let nextIndex = activeGameIndex;
      if (dx < -threshold || (dx < 0 && velocity > SWIPE_VELOCITY_THRESHOLD)) {
        nextIndex = Math.min(activeGameIndex + 1, totalSlides - 1);
      } else if (
        dx > threshold ||
        (dx > 0 && velocity > SWIPE_VELOCITY_THRESHOLD)
      ) {
        nextIndex = Math.max(activeGameIndex - 1, 0);
      }

      if (nextIndex !== activeGameIndex) {
        setIndex(nextIndex);
      }

      dragStart.current = null;
      setDragOffset(0);
      setIsDragging(false);
    },
    [activeGameIndex, setIndex, totalSlides],
  );

  return (
    <div className={cn(gameCardsVariants({ variant, className }))} {...props}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-primary-100 font-secondary text-2xl uppercase">
            MY GAMES
          </h2>
          <div className="h-6 flex items-center px-2 rounded-full text-primary-100 bg-primary-800">
            <span className="font-secondary text-xl">{activeGameCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-10 w-12 p-0"
            wrapperClassName={activeGameIndex <= 0 ? "opacity-25" : ""}
            onClick={handlePrev}
            disabled={activeGameIndex <= 0}
            aria-label="Previous game"
          >
            <ArrowLeftIcon size="md" />
          </Button>
          <Button
            variant="secondary"
            className="h-10 w-12 p-0"
            wrapperClassName={
              activeGameIndex >= totalSlides - 1 ? "opacity-25" : ""
            }
            onClick={handleNext}
            disabled={activeGameIndex >= totalSlides - 1}
            aria-label="Next game"
          >
            <ArrowRightIcon size="md" />
          </Button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="overflow-hidden rounded-md touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateX(calc(-${activeGameIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {games.map((game, idx) => {
            const isNew = !game.gameId;
            return (
              <div
                key={game.gameId ?? `new-${idx}`}
                className="w-full shrink-0"
              >
                <GameCard
                  variant={isNew ? "new" : "active"}
                  seed={isNew ? 99 : 42 + idx}
                  loading={!isNew && loadingGameId === game.gameId}
                  fields={[
                    {
                      label: "Moonrocks",
                      value:
                        game.moonrocks !== undefined && game.moonrocks > 0
                          ? String(game.moonrocks)
                          : "---",
                    },
                    {
                      label: "Expires In",
                      value: formatExpiry(game.expiration, now),
                    },
                    {
                      label: "Game ID",
                      value: game.gameId ? `#${game.gameId}` : "---",
                    },
                    {
                      label: "Max Payout",
                      value: game.payout,
                    },
                  ]}
                  onClick={() => {
                    if (didDrag.current) return;
                    if (isNew) {
                      requireLogin(() => onNewGame());
                    } else if (game.gameId) {
                      requireLogin(() => onPlay(game.gameId as number));
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
