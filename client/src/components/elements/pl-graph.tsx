import { motion } from "framer-motion";
import {
  type PointerEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEventHandler,
} from "react";

export interface PLDataPoint {
  value: number; // The P/L value at this point (delta or absolute based on mode)
  variant: "green" | "red" | "yellow" | "blue"; // Color of the dot
  id?: number; // Optional unique ID for animation keys
}

export interface PLGraphProps {
  data: PLDataPoint[];
  className?: string;
  mode?: "delta" | "absolute"; // delta = value is change per point, absolute = value is total at each point
  title?: string; // Custom title (default: "P/L")
  baseline?: number; // The baseline value (default: 0 for delta, 100 for absolute)
}

// Map variant to actual color
const getVariantColor = (variant: PLDataPoint["variant"]): string => {
  switch (variant) {
    case "green":
      return "#36F818"; // --green-400
    case "red":
      return "#FF1E00"; // --red-100
    case "blue":
      return "#7487FF"; // --blue-100
    case "yellow":
      return "#FFF121"; // --yellow-100
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
}: PLGraphProps) => {
  const baseViewHeight = 100;
  const [baseViewWidth, setBaseViewWidth] = useState(100);
  const baseViewWidthRef = useRef(100);
  const prevBaseViewWidthRef = useRef(100);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: baseViewWidth,
    height: baseViewHeight,
  });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    originWidth: baseViewWidth,
    originHeight: baseViewHeight,
  });
  const interactionRef = useRef<HTMLDivElement | null>(null);
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

  // Calculate Y-axis range - baseline position moves based on data
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
    const maxVal = Math.max(...values, baseline);
    const minVal = Math.min(...values, baseline);
    const hasBelowBaseline = minVal < baseline;

    // Add padding to the top
    const topPadding = Math.max((maxVal - baseline) * 0.2, 10);
    let max = Math.ceil((maxVal + topPadding) / 10) * 10;
    let min: number;

    if (hasBelowBaseline) {
      // If there are values below baseline, include them
      const bottomPadding = Math.max((baseline - minVal) * 0.2, 10);
      min = Math.floor((minVal - bottomPadding) / 10) * 10;
    } else {
      // No values below baseline - min is baseline
      min = baseline;
    }

    // Enforce minimum range to prevent cramped graph
    const minRange = 50;
    const currentRange = max - min;
    if (currentRange < minRange) {
      max = Math.ceil((max + (minRange - currentRange)) / 10) * 10;
    }

    // Calculate baseline position as percentage from top
    const range = max - min;
    const baselinePos = ((max - baseline) / range) * 100;

    return { min, max, baselinePos, hasBelowBaseline };
  }, [cumulativeData, baseline]);

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

    const width = baseViewWidth;
    const height = baseViewHeight;
    const paddingX = width * 0.12;
    const paddingY = height * 0.08;

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
  }, [baseViewHeight, baseViewWidth, cumulativeData, yRange]);

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

  const minViewWidth = baseViewWidth / zoomMax;
  const maxViewWidth = baseViewWidth / zoomMin;
  const minViewHeight = baseViewHeight / zoomMax;
  const maxViewHeight = baseViewHeight / zoomMin;

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const clampViewBox = (next: typeof viewBox) => {
    const minX = Math.min(0, baseViewWidth - next.width);
    const maxX = Math.max(0, baseViewWidth - next.width);
    const minY = Math.min(0, baseViewHeight - next.height);
    const maxY = Math.max(0, baseViewHeight - next.height);
    return {
      ...next,
      x: clamp(next.x, minX, maxX),
      y: clamp(next.y, minY, maxY),
    };
  };

  const unitPerPx = baseViewHeight / Math.max(containerSize.height, 1);
  const pointRadius = 6 * unitPerPx;
  const pointStrokeWidth = 1 * unitPerPx;
  const lineStrokeWidth = 1.5 * unitPerPx;
  const gridStrokeWidth = 1 * unitPerPx;
  const baselineStrokeWidth = 1 * unitPerPx;

  useEffect(() => {
    const target = interactionRef.current;
    if (!target || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      setContainerSize({ width, height });
      const nextWidth = (width / height) * baseViewHeight;
      if (Math.abs(nextWidth - baseViewWidthRef.current) < 0.01) return;
      baseViewWidthRef.current = nextWidth;
      setBaseViewWidth(nextWidth);
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [baseViewHeight]);

  useEffect(() => {
    setViewBox((prev) => {
      const scaleX = baseViewWidth / prevBaseViewWidthRef.current;
      const next = clampViewBox({
        x: prev.x * scaleX,
        y: prev.y,
        width: prev.width * scaleX,
        height: prev.height,
      });
      prevBaseViewWidthRef.current = baseViewWidth;
      return next;
    });
  }, [baseViewWidth]);

  if (data.length === 0) {
    return null;
  }

  const resetView = () => {
    setViewBox({
      x: 0,
      y: 0,
      width: baseViewWidth,
      height: baseViewHeight,
    });
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const target = interactionRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const direction = event.deltaY < 0 ? 1 : -1;
    const zoomFactor = direction > 0 ? 1.12 : 0.9;

    setViewBox((prev) => {
      const nextWidth = clamp(
        prev.width / zoomFactor,
        minViewWidth,
        maxViewWidth,
      );
      const nextHeight = clamp(
        prev.height / zoomFactor,
        minViewHeight,
        maxViewHeight,
      );
      if (nextWidth === prev.width && nextHeight === prev.height) return prev;

      const pointerXRatio = pointerX / rect.width;
      const pointerYRatio = pointerY / rect.height;
      const pointerXInView = prev.x + pointerXRatio * prev.width;
      const pointerYInView = prev.y + pointerYRatio * prev.height;
      const nextX = pointerXInView - pointerXRatio * nextWidth;
      const nextY = pointerYInView - pointerYRatio * nextHeight;

      return clampViewBox({
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      });
    });
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    isPanningRef.current = true;
    setIsPanning(true);
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: viewBox.x,
      originY: viewBox.y,
      originWidth: viewBox.width,
      originHeight: viewBox.height,
    };
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isPanningRef.current) return;
    event.preventDefault();
    const target = interactionRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const deltaX = event.clientX - panRef.current.startX;
    const deltaY = event.clientY - panRef.current.startY;
    const shiftX = (deltaX / rect.width) * panRef.current.originWidth;
    const shiftY = (deltaY / rect.height) * panRef.current.originHeight;
    setViewBox((prev) =>
      clampViewBox({
        ...prev,
        x: panRef.current.originX - shiftX,
        y: panRef.current.originY - shiftY,
      }),
    );
  };

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isPanningRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isPanningRef.current = false;
    setIsPanning(false);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header: stats and net value */}
      <div className="flex items-center justify-between">
        <div className="font-secondary text-green-700 text-[clamp(0.75rem,1.8svh,1.125rem)] tracking-widest uppercase">
          {title}:{" "}
          <span className="font-secondary text-green-700">
            {stats.wins}/{stats.losses}
          </span>
        </div>
        <div
          className={`font-secondary text-[clamp(0.75rem,1.8svh,1.125rem)] tracking-widest ${
            stats.netPL >= 0 ? "text-green-700" : "text-red-400"
          }`}
        >
          {stats.netPL >= 0 ? "+" : ""}
          {stats.netPL}
        </div>
      </div>

      {/* Graph container */}
      <div className="relative w-full h-[clamp(80px,16svh,160px)]">
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

        {/* Graph area */}
        <div className="absolute left-10 right-0 top-0 bottom-0 overflow-hidden">
          <div
            ref={interactionRef}
            className={`absolute inset-0 ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ touchAction: "none" }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={resetView}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
              preserveAspectRatio="xMidYMid meet"
              shapeRendering="geometricPrecision"
            >
              <defs>
                <radialGradient id="grid-fade" cx="50%" cy="50%" r="70%">
                  <stop offset="30%" stopColor="white" stopOpacity="1" />
                  <stop offset="65%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask
                  id="grid-mask"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={baseViewWidth}
                  height={baseViewHeight}
                >
                  <rect
                    x="0"
                    y="0"
                    width={baseViewWidth}
                    height={baseViewHeight}
                    fill="url(#grid-fade)"
                  />
                </mask>

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
                  id="glow-red"
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
              </defs>

              {/* Extended grid background with fade */}
              <g mask="url(#grid-mask)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={(i + 1) * 0.077 * baseViewWidth}
                    y1={0}
                    x2={(i + 1) * 0.077 * baseViewWidth}
                    y2={baseViewHeight}
                    stroke="rgba(20, 83, 45, 0.4)"
                    strokeWidth={gridStrokeWidth}
                    strokeDasharray="4 4"
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={(i + 1) * 0.111 * baseViewHeight}
                    x2={baseViewWidth}
                    y2={(i + 1) * 0.111 * baseViewHeight}
                    stroke="rgba(20, 83, 45, 0.4)"
                    strokeWidth={gridStrokeWidth}
                    strokeDasharray="4 4"
                  />
                ))}
              </g>

              {/* Baseline line - dashed white/green */}
              <line
                x1={0}
                y1={(yRange.baselinePos / 100) * baseViewHeight}
                x2={baseViewWidth}
                y2={(yRange.baselinePos / 100) * baseViewHeight}
                stroke="#15803d"
                strokeWidth={baselineStrokeWidth}
                strokeDasharray="4 4"
              />

              {/* Lines connecting points */}
              {graphPoints.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = graphPoints[index - 1];
                const isNew = newPointIds.has(point.id);
                return (
                  <motion.line
                    key={`line-${point.id}`}
                    x1={prevPoint.x}
                    y1={prevPoint.y}
                    x2={point.x}
                    y2={point.y}
                    stroke="#348F1B"
                    strokeWidth={lineStrokeWidth}
                    initial={isNew ? { pathLength: 0, opacity: 0 } : false}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                );
              })}

              {/* Points as SVG circles */}
              {graphPoints.map((point) => {
                const filterName = `glow-${
                  point.color === "#36F818"
                    ? "green"
                    : point.color === "#FF1E00"
                      ? "red"
                      : point.color === "#7487FF"
                        ? "blue"
                        : "yellow"
                }`;
                const isNew = newPointIds.has(point.id);
                return (
                  <motion.circle
                    key={`point-${point.id}`}
                    cx={point.x}
                    cy={point.y}
                    r={pointRadius}
                    fill={point.color}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={pointStrokeWidth}
                    filter={`url(#${filterName})`}
                    initial={isNew ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      delay: isNew ? 0.1 : 0,
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
