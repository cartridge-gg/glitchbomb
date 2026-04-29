import { cva, type VariantProps } from "class-variance-authority";
import { useCallback, useMemo, useRef, useState } from "react";
import { GameCard } from "@/components/elements/game-card";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GameCardsGame {
  id: number;
  moonrocks: number;
  points: number;
  /** Unix timestamp at which the game expires; 0 = not yet started. */
  expiration: number;
  multiplier: number;
  stake: number;
}

export interface GameCardsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onPlay">,
    VariantProps<typeof gameCardsVariants> {
  activeGames: GameCardsGame[];
  gameId?: number;
  setGameId: (id: number) => void;
  loadingGameId: number | null;
  formatExpiry: (expiration: number) => string;
  formatMaxPayout: (stake: number) => string;
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

export const GameCards = ({
  activeGames,
  gameId,
  setGameId,
  loadingGameId,
  formatExpiry,
  formatMaxPayout,
  onPlay,
  onNewGame,
  onPractice,
  requireLogin,
  variant,
  className,
  ...props
}: GameCardsProps) => {
  const totalSlides = activeGames.length + 1;
  const newCardIndex = activeGames.length;

  const activeGameIndex = useMemo(() => {
    if (!gameId) return newCardIndex;
    const idx = activeGames.findIndex((g) => g.id === gameId);
    return idx >= 0 ? idx : newCardIndex;
  }, [gameId, activeGames, newCardIndex]);

  const setIndex = useCallback(
    (idx: number) => {
      if (idx >= activeGames.length) {
        setGameId(NEW_GAME_ID);
      } else if (idx >= 0) {
        setGameId(activeGames[idx].id);
      }
    },
    [activeGames, setGameId],
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
            <span className="font-secondary text-xl">{activeGames.length}</span>
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
          {activeGames.map((game, idx) => (
            <div key={game.id} className="w-full shrink-0">
              <GameCard
                variant="active"
                seed={42 + idx}
                loading={loadingGameId === game.id}
                fields={[
                  {
                    label: "Moonrocks",
                    value: String(game.moonrocks + game.points || "---"),
                  },
                  {
                    label: "Expires In",
                    value: formatExpiry(game.expiration) || "24H",
                  },
                  {
                    label: "Game ID",
                    value: game.id ? `#${game.id}` : "---",
                  },
                  {
                    label: "Max Payout",
                    value: formatMaxPayout(game.stake),
                  },
                ]}
                onClick={() => {
                  if (didDrag.current) return;
                  requireLogin(() => onPlay(game.id));
                }}
              />
            </div>
          ))}

          <div key="new-game" className="w-full shrink-0">
            <GameCard
              variant="new"
              seed={99}
              fields={[
                { label: "Moonrocks", value: "---" },
                { label: "Expires In", value: "---" },
                { label: "Multiplier", value: "---" },
                { label: "Max Payout", value: "---" },
              ]}
              onClick={() => {
                if (didDrag.current) return;
                requireLogin(() => onNewGame());
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
