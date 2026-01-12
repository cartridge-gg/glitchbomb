export interface PointsProgressProps {
  points: number;
  milestone: number;
  className?: string;
}

export const PointsProgress = ({
  points,
  milestone,
  className = "",
}: PointsProgressProps) => {
  const progress = Math.min((points / milestone) * 100, 100);

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {/* Current Points */}
      <span
        className="text-green-400 text-5xl font-glitch"
        style={{ textShadow: "0 0 20px rgba(74, 222, 128, 0.3)" }}
      >
        {points}
      </span>
      {/* Goal Progress */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-green-800 font-secondary text-sm tracking-wider">
            Goal
          </span>
          <span className="text-green-400 font-secondary text-sm tracking-widest">
            {milestone}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-5 bg-green-950 rounded-sm overflow-hidden">
          <div
            className="h-full bg-green-700 rounded-l-sm transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
