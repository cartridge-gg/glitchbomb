import { Button } from "@/components/ui/button";

export interface CostStepperProps {
  /** Total number of tiers */
  count: number;
  /** Currently selected tier index (0-based) */
  selectedIndex: number;
  /** Called when the user clicks - */
  onDecrement: () => void;
  /** Called when the user clicks + */
  onIncrement: () => void;
}

export const CostStepper = ({
  count,
  selectedIndex,
  onDecrement,
  onIncrement,
}: CostStepperProps) => {
  const activeColor = "#36F818";
  const inactiveColor = "rgba(54, 248, 24, 0.08)";

  return (
    <div className="flex items-center gap-2">
      {/* Decrement button */}
      <Button
        variant="secondary"
        gradient="green"
        className="h-10 w-10 p-0 shrink-0 font-secondary text-lg"
        onClick={onDecrement}
        disabled={selectedIndex <= 0}
        aria-label="Decrease cost"
      >
        -
      </Button>

      {/* Tier indicators */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="h-5 flex-1 rounded-sm transition-all duration-200"
            style={{
              backgroundColor: i <= selectedIndex ? activeColor : inactiveColor,
              transform: i === selectedIndex ? "scaleY(1.3)" : "scaleY(1)",
            }}
          />
        ))}
      </div>

      {/* Increment button */}
      <Button
        variant="secondary"
        gradient="green"
        className="h-10 w-10 p-0 shrink-0 font-secondary text-lg"
        onClick={onIncrement}
        disabled={selectedIndex >= count - 1}
        aria-label="Increase cost"
      >
        +
      </Button>
    </div>
  );
};
