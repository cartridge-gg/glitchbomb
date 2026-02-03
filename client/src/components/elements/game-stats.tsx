import { HeartIcon } from "@/components/icons";

interface ProgressBarProps {
  progress: number;
  trackColor: string;
  fillColor: string;
  glowColor: string;
}

const ProgressBar = ({
  progress,
  trackColor,
  fillColor,
  glowColor,
}: ProgressBarProps) => (
  <div
    className="w-full h-[clamp(10px,2svh,18px)] rounded-full overflow-hidden"
    style={{ backgroundColor: trackColor }}
  >
    <div className="w-full h-full p-[3px]">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          minWidth: "10px",
          borderRadius: "9999px",
          backgroundColor: fillColor,
          boxShadow: `0 0 10px ${glowColor}`,
        }}
      />
    </div>
  </div>
);

export interface GameStatsProps {
  points: number;
  milestone: number;
  health: number;
  maxHealth?: number;
  level: number;
  className?: string;
}

export const GameStats = ({
  points,
  milestone,
  health,
  maxHealth = 5,
  level,
  className = "",
}: GameStatsProps) => {
  const goalProgress = Math.min(
    milestone > 0 ? (points / milestone) * 100 : 0,
    100,
  );
  const goalDisplayProgress = goalProgress === 0 ? 3 : goalProgress;
  const healthProgress = (health / maxHealth) * 100;

  return (
    <div
      className={`flex items-center gap-[clamp(10px,2.8svh,48px)] ${className}`}
    >
      {/* Left - Health */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-pink-400 font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-wider">
            Health
          </span>
          <div className="flex items-center gap-1">
            <HeartIcon
              className="w-4 h-4"
              style={{
                color: "#FF0080",
                filter: "drop-shadow(0 0 4px #FF0080)",
              }}
            />
            <span className="text-pink-400 font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)]">
              {health}
            </span>
          </div>
        </div>
        {/* Health Bar */}
        <ProgressBar
          progress={healthProgress}
          trackColor="rgba(9, 38, 4, 0.8)"
          fillColor="#FF40A0"
          glowColor="rgba(255, 0, 128, 0.5)"
        />
      </div>

      {/* Center - Points & Level */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-green-400 font-glitch text-[clamp(1.5rem,5svh,3rem)]"
          style={{ textShadow: "0 0 20px rgba(74, 222, 128, 0.3)" }}
        >
          {points}
        </span>
        <div className="flex items-center justify-center px-3 py-0.5 rounded-full border border-green-700">
          <span className="font-secondary text-green-400 text-[clamp(0.6rem,1.4svh,0.75rem)] tracking-wider">
            Lvl {level}
          </span>
        </div>
      </div>

      {/* Right - Goal */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-green-400 font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)] tracking-wider">
            Goal
          </span>
          <div className="flex items-center gap-1">
            <span className="text-green-400 text-sm">✦</span>
            <span className="text-green-400 font-secondary text-[clamp(0.6rem,1.4svh,0.875rem)]">
              {milestone}
            </span>
          </div>
        </div>
        {/* Goal Progress Bar */}
        <ProgressBar
          progress={goalDisplayProgress}
          trackColor="rgba(9, 38, 4, 0.8)"
          fillColor="#36F818"
          glowColor="rgba(54, 248, 24, 0.4)"
        />
      </div>
    </div>
  );
};
