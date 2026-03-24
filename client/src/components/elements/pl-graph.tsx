import { motion } from "framer-motion";
import {
  type PointerEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface PLDataPoint {
  value: number; // The P/L value at this point (delta or absolute based on mode)
  variant: "green" | "red" | "yellow" | "blue" | "grey" | "pink"; // Color of the dot
  id?: number; // Optional unique ID for animation keys
}

export interface PLGraphProps {
  data: PLDataPoint[];
  className?: string;
  mode?: "delta" | "absolute"; // delta = value is change per point, absolute = value is total at each point
  title?: string; // Custom title (default: "P/L")
  baseline?: number; // The baseline value (default: 0 for delta, 100 for absolute)
  goal?: number; // Goal value for the level — sets the chart's y-axis max
}

// Map variant to actual color
const getVariantColor = (variant: PLDataPoint["variant"]): string => {
  switch (variant) {
    case "green":
      return "#36F818"; // --green-400
    case "red":
      return "#FFFFFF"; // white for bombs
    case "blue":
      return "#9747FF"; // --blue-100
    case "yellow":
      return "#4C91FF"; // --yellow-100
    case "grey":
      return "#AAAAAA";
    case "pink":
      return "#FF0099"; // --orb-heart
    default:
      return "#36F818";
  }
};

export const PLGraph = ({
  data,
  className = "",
  mode = "delta",
  title = "P/L",
  baseline: baselineProp,
  goal,
}: PLGraphProps) => {
  const interactionEnabled = false;
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const zoomMin = 0.75;
  const zoomMax = 3.5;

  // Default baseline: 0 for delta mode, 100 for absolute mode
  const baseline = baselineProp ?? (mode === "absolute" ? 100 : 0);
  // Calculate cumulative values at each point
  const cumulativeData = useMemo(() => {
    if (mode === "absolute") {
      // Values are already absolute (like potential_moonrocks)
      return data.map((point) => ({
        ...point,
        cumulative: point.value,
      }));
    }
    // Delta mode: accumulate values
    let cumulative = 0;
    return data.map((point) => {
      cumulative += point.value;
      return {
        ...point,
        cumulative,
      };
    });
  }, [data, mode]);

  // Calculate wins and losses (based on deltas or value changes)
  const stats = useMemo(() => {
    if (mode === "absolute") {
      // For absolute mode, calculate deltas between consecutive points
      let wins = 0;
      let losses = 0;
      for (let i = 1; i < data.length; i++) {
        const delta = data[i].value - data[i - 1].value;
        if (delta > 0) wins++;
        else if (delta < 0) losses++;
      }
      // Net P/L is relative to baseline (e.g., 100)
      const currentValue =
        data.length > 0 ? data[data.length - 1].value : baseline;
      const netPL = currentValue - baseline;
      return { wins, losses, netPL };
    }
    // Delta mode: original logic
    const wins = data.filter((d) => d.value > 0).length;
    const losses = data.filter((d) => d.value < 0).length;
    const netPL = data.reduce((sum, d) => sum + d.value, 0);
    return { wins, losses, netPL };
  }, [data, mode, baseline]);

  // Calculate Y-axis range — fit tightly to data, use goal as max when provided
  const yRange = useMemo(() => {
    if (cumulativeData.length === 0) {
      return {
        min: baseline - 20,
        max: baseline + 20,
        baselinePos: 50,
        hasBelowBaseline: false,
      };
    }

    const values = cumulativeData.map((d) => d.cumulative);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    // Min = lowest data point; Max = goal (or highest data point if it exceeds goal)
    let min = dataMin;
    let max = goal != null ? Math.max(goal, dataMax) : dataMax;

    // Add small padding (5%) so dots aren't right on the edge
    const range = max - min || 1;
    const padding = range * 0.08;
    min = Math.floor(min - padding);
    max = Math.ceil(max + padding);

    // Enforce minimum range to prevent cramped graph
    const minRange = 20;
    if (max - min < minRange) {
      const midpoint = (max + min) / 2;
      min = Math.floor(midpoint - minRange / 2);
      max = Math.ceil(midpoint + minRange / 2);
    }

    const hasBelowBaseline = min < baseline;

    // Calculate baseline position as percentage from top
    const finalRange = max - min;
    const baselinePos = ((max - baseline) / finalRange) * 100;

    return { min, max, baselinePos, hasBelowBaseline };
  }, [cumulativeData, baseline, goal]);

  // Calculate Y-axis labels (max 3 labels: top, middle, bottom)
  const yAxisLabels = useMemo(() => {
    const { min, max, hasBelowBaseline } = yRange;
    const labels: { value: number; position: number }[] = [];
    const range = max - min;

    // Always show max at top
    labels.push({ value: max, position: 0 });

    // Add bottom label
    if (hasBelowBaseline) {
      labels.push({ value: min, position: 100 });
    } else {
      // Show baseline at bottom when no values below baseline
      labels.push({ value: baseline, position: 100 });
    }

    // Add one middle label (baseline or midpoint)
    const baselinePosition = ((max - baseline) / range) * 100;
    // Only add middle label if there's enough space (between 20% and 80%)
    if (baselinePosition > 20 && baselinePosition < 80) {
      labels.push({ value: baseline, position: baselinePosition });
    } else if (labels.length < 3) {
      // If baseline is too close to edges, add a midpoint label
      const midValue = Math.round((max + min) / 2 / 10) * 10;
      const midPosition = ((max - midValue) / range) * 100;
      if (
        midPosition > 20 &&
        midPosition < 80 &&
        midValue !== max &&
        midValue !== min
      ) {
        labels.push({ value: midValue, position: midPosition });
      }
    }

    // Sort by position (top to bottom)
    return labels.sort((a, b) => a.position - b.position);
  }, [yRange, baseline]);

  // Calculate graph points
  const graphPoints = useMemo(() => {
    if (cumulativeData.length === 0) return [];

    const width = 100;
    const height = 100;
    const paddingX = 12;
    const paddingY = 8;

    const { min, max } = yRange;
    const range = max - min;

    return cumulativeData.map((point, index) => {
      const x =
        paddingX +
        (index / Math.max(cumulativeData.length - 1, 1)) *
          (width - paddingX * 2);

      // Y position: higher cumulative = higher on graph (lower y value)
      const normalizedY = (max - point.cumulative) / range;
      const y = paddingY + normalizedY * (height - paddingY * 2);

      return {
        x,
        y,
        color: getVariantColor(point.variant),
        cumulative: point.cumulative,
        index,
        id: point.id ?? index,
      };
    });
  }, [cumulativeData, yRange]);

  // Track which points have been rendered to animate only new ones
  const renderedPointsRef = useRef<Set<number>>(new Set());

  // Determine which points are new (for animation)
  const newPointIds = useMemo(() => {
    const newIds = new Set<number>();
    graphPoints.forEach((point) => {
      if (!renderedPointsRef.current.has(point.id)) {
        newIds.add(point.id);
      }
    });
    return newIds;
  }, [graphPoints]);

  // Update rendered points after render
  useEffect(() => {
    graphPoints.forEach((point) => {
      renderedPointsRef.current.add(point.id);
    });
  }, [graphPoints]);

  const resetView = () => {
    setView({ scale: 1, x: 0, y: 0 });
  };

  const applyZoomAt = useCallback(
    (zoomFactor: number, pointerX: number, pointerY: number) => {
      setView((prev) => {
        const nextScale = Math.min(
          zoomMax,
          Math.max(zoomMin, prev.scale * zoomFactor),
        );
        if (nextScale === prev.scale) return prev;
        const scaleRatio = nextScale / prev.scale;
        const nextX = pointerX - (pointerX - prev.x) * scaleRatio;
        const nextY = pointerY - (pointerY - prev.y) * scaleRatio;
        return { scale: nextScale, x: nextX, y: nextY };
      });
    },
    [zoomMax, zoomMin],
  );

  const handleWheelEvent = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      const target = zoomRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const zoomFactor =
        event.ctrlKey || event.metaKey
          ? Math.exp(-event.deltaY * 0.002)
          : event.deltaY < 0
            ? 1.12
            : 0.9;

      applyZoomAt(zoomFactor, pointerX, pointerY);
    },
    [applyZoomAt],
  );

  useEffect(() => {
    if (!interactionEnabled) return;
    const target = zoomRef.current;
    if (!target) return;
    const listener = (event: WheelEvent) => handleWheelEvent(event);
    target.addEventListener("wheel", listener, { passive: false });
    return () => target.removeEventListener("wheel", listener);
  }, [handleWheelEvent, interactionEnabled]);

  useEffect(() => {
    if (!interactionEnabled) return;
    const target = zoomRef.current as unknown as HTMLElement | null;
    if (!target) return;
    let lastScale = 1;
    const onGestureStart = (event: Event) => {
      event.preventDefault();
      const scale = (event as unknown as { scale?: number }).scale ?? 1;
      lastScale = scale;
    };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const scale = (event as unknown as { scale?: number }).scale ?? 1;
      const delta = scale / lastScale;
      lastScale = scale;
      const rect = target.getBoundingClientRect();
      applyZoomAt(delta, rect.width / 2, rect.height / 2);
    };
    target.addEventListener("gesturestart", onGestureStart, { passive: false });
    target.addEventListener("gesturechange", onGestureChange, {
      passive: false,
    });
    return () => {
      target.removeEventListener("gesturestart", onGestureStart);
      target.removeEventListener("gesturechange", onGestureChange);
    };
  }, [applyZoomAt, interactionEnabled]);

  if (data.length === 0) {
    return null;
  }

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!interactionEnabled) return;
    if (event.button !== 0) return;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    isPanningRef.current = true;
    setIsPanning(true);
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    };
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!interactionEnabled) return;
    if (!isPanningRef.current) return;
    event.preventDefault();
    const deltaX = event.clientX - panRef.current.startX;
    const deltaY = event.clientY - panRef.current.startY;
    setView((prev) => ({
      ...prev,
      x: panRef.current.originX + deltaX,
      y: panRef.current.originY + deltaY,
    }));
  };

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!interactionEnabled) return;
    if (!isPanningRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isPanningRef.current = false;
    setIsPanning(false);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Graph container */}
      <div
        className="relative w-full h-[clamp(100px,20svh,200px)]"
        aria-label={title}
        role="img"
      >
        {/* Y-axis labels as pills */}
        <div className="absolute left-0 top-0 bottom-0 z-10">
          {yAxisLabels.map((label, index) => (
            <span
              key={`label-${label.value}-${index}`}
              className="absolute font-secondary text-green-400 text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-widest leading-none bg-green-950 px-[clamp(6px,1.4svh,12px)] py-[clamp(2px,0.7svh,6px)] rounded-full"
              style={{
                top: `${label.position}%`,
                transform:
                  label.position === 0
                    ? "translateY(0)"
                    : label.position === 100
                      ? "translateY(-100%)"
                      : "translateY(-50%)",
              }}
            >
              {label.value}
            </span>
          ))}
        </div>
        <div className="absolute right-0 top-0 z-10">
          <span
            className={`font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-widest leading-none bg-green-950 px-[clamp(6px,1.4svh,12px)] py-[clamp(2px,0.7svh,6px)] rounded-full ${
              stats.netPL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {stats.netPL >= 0 ? "+" : ""}
            {stats.netPL}
          </span>
        </div>

        {/* Graph area */}
        <div className="absolute left-10 right-0 top-0 bottom-0 overflow-hidden">
          <div
            ref={zoomRef}
            className={`absolute inset-0 ${interactionEnabled ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
            style={{ touchAction: interactionEnabled ? "none" : "auto" }}
            onPointerDown={interactionEnabled ? handlePointerDown : undefined}
            onPointerMove={interactionEnabled ? handlePointerMove : undefined}
            onPointerUp={interactionEnabled ? handlePointerUp : undefined}
            onPointerLeave={interactionEnabled ? handlePointerUp : undefined}
            onPointerCancel={interactionEnabled ? handlePointerUp : undefined}
            onDoubleClick={interactionEnabled ? resetView : undefined}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: "0 0",
                willChange: "transform",
              }}
            >
              {/* Extended grid background with fade */}
              <div
                className="absolute -inset-12 pointer-events-none"
                style={{
                  maskImage:
                    "radial-gradient(ellipse 100% 120% at 50% 50%, black 30%, transparent 65%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 100% 120% at 50% 50%, black 30%, transparent 65%)",
                }}
              >
                <svg className="absolute inset-0 w-full h-full">
                  {/* Vertical grid lines */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={`${(i + 1) * 7.7}%`}
                      y1="0"
                      x2={`${(i + 1) * 7.7}%`}
                      y2="100%"
                      stroke="rgba(20, 83, 45, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  {/* Horizontal grid lines */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={`${(i + 1) * 11.1}%`}
                      x2="100%"
                      y2={`${(i + 1) * 11.1}%`}
                      stroke="rgba(20, 83, 45, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                </svg>
              </div>

              {/* Baseline line - dashed white/green */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-green-700"
                style={{ top: `${yRange.baselinePos}%` }}
              />

              {/* Chart area for points and lines */}
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  {/* Glow filters for each color */}
                  <filter
                    id="glow-green"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="glow-white"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="glow-blue"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="glow-yellow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="glow-grey"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter
                    id="glow-pink"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  {/* Glitch filter for chart lines — red/blue chromatic split */}
                  <filter
                    id="glitch-line"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feOffset in="SourceGraphic" dx="0" dy="0" result="base" />
                    <feOffset
                      in="SourceGraphic"
                      dx="-2"
                      dy="0"
                      result="red-shift"
                    >
                      <animate
                        attributeName="dx"
                        values="0;0;0;0;0;-3;3;-2;0;0;0;0;0;0;0;0;0;2;-3;2;0;0;0;0;0;0;0;0;0;-2;3;-3;0;0;0;0"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </feOffset>
                    <feOffset
                      in="SourceGraphic"
                      dx="2"
                      dy="0"
                      result="blue-shift"
                    >
                      <animate
                        attributeName="dx"
                        values="0;0;0;0;0;3;-3;2;0;0;0;0;0;0;0;0;0;-2;3;-2;0;0;0;0;0;0;0;0;0;2;-3;3;0;0;0;0"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </feOffset>
                    <feColorMatrix
                      in="red-shift"
                      type="matrix"
                      values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0"
                      result="red-channel"
                    />
                    <feColorMatrix
                      in="blue-shift"
                      type="matrix"
                      values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0.7 0"
                      result="blue-channel"
                    />
                    <feBlend
                      in="red-channel"
                      in2="blue-channel"
                      mode="screen"
                      result="aberration"
                    />
                    <feBlend in="base" in2="aberration" mode="screen" />
                  </filter>
                </defs>

                {/* Lines connecting points */}
                <g filter="url(#glitch-line)">
                  {graphPoints.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = graphPoints[index - 1];
                    const isNew = newPointIds.has(point.id);
                    return (
                      <motion.line
                        key={`line-${point.id}`}
                        x1={`${prevPoint.x}%`}
                        y1={`${prevPoint.y}%`}
                        x2={`${point.x}%`}
                        y2={`${point.y}%`}
                        stroke="#348F1B"
                        strokeWidth="1.5"
                        initial={isNew ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    );
                  })}
                </g>

                {/* Points as SVG circles */}
                {graphPoints.map((point) => {
                  const filterName = `glow-${point.color === "#36F818" ? "green" : point.color === "#FFFFFF" ? "white" : point.color === "#9747FF" ? "blue" : point.color === "#AAAAAA" ? "grey" : point.color === "#FF0099" ? "pink" : "yellow"}`;
                  const isNew = newPointIds.has(point.id);
                  const isBomb = point.color === "#FFFFFF";
                  const circleProps = {
                    cx: `${point.x}%`,
                    cy: `${point.y}%`,
                    r: "6",
                    fill: point.color,
                    stroke: "rgba(255,255,255,0.8)",
                    strokeWidth: "1",
                    filter: `url(#${filterName})`,
                    initial: isNew ? { scale: 0, opacity: 0 } : false,
                    animate: { scale: 1, opacity: 1 },
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                      delay: isNew ? 0.1 : 0,
                    },
                  } as const;
                  return isBomb ? (
                    <g key={`point-${point.id}`} className="glitch-icon">
                      <motion.circle {...circleProps} />
                    </g>
                  ) : (
                    <motion.circle
                      key={`point-${point.id}`}
                      {...circleProps}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
