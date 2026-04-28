export interface PurchaseStepperProps {
  count: number;
  selectedIndex: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

export const PurchaseStepper = ({
  count,
  selectedIndex,
  onDecrement,
  onIncrement,
}: PurchaseStepperProps) => {
  const isMin = selectedIndex <= 0;
  const isMax = selectedIndex >= count - 1;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg disabled:opacity-50"
        style={{ backgroundColor: "#071304" }}
        onClick={onDecrement}
        disabled={isMin}
        aria-label="Decrease tier"
      >
        <svg width="12" height="3" viewBox="0 0 12 3" fill="none">
          <rect
            width="12"
            height="2.67"
            rx="1"
            fill={isMin ? "#255115" : "#36F818"}
          />
        </svg>
      </button>

      <div
        className="flex-1 flex items-center gap-1 rounded-xl"
        style={{ padding: "6px" }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-3 transition-all duration-200"
            style={{
              backgroundColor:
                i <= selectedIndex ? "#36F818" : "rgba(255, 255, 255, 0.04)",
              boxShadow:
                i <= selectedIndex
                  ? "1px 1px 0px rgba(0, 0, 0, 0.12), inset 1px 1px 0px rgba(255, 255, 255, 0.12)"
                  : "none",
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg disabled:opacity-50"
        style={{ backgroundColor: "#092604" }}
        onClick={onIncrement}
        disabled={isMax}
        aria-label="Increase tier"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect
            x="6.67"
            y="0"
            width="2.67"
            height="16"
            rx="1"
            fill={isMax ? "#255115" : "#36F818"}
          />
          <rect
            x="0"
            y="6.67"
            width="16"
            height="2.67"
            rx="1"
            fill={isMax ? "#255115" : "#36F818"}
          />
        </svg>
      </button>
    </div>
  );
};
