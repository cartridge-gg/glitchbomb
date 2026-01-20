import { BombIcon } from "@/components/icons";

export interface GameRecapProps {
  points: number;
  level: number;
}

export const GameRecap = ({ points, level }: GameRecapProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-50"
          style={{ backgroundColor: "var(--red-100)" }}
        />
        <BombIcon className="w-20 h-20 text-red-400 relative z-10" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-white uppercase text-xl font-glitch">GAME OVER</h2>
        <p className="text-green-600 font-secondary text-xs tracking-wide">
          <span className="text-white font-bold">{points}</span> points • Level{" "}
          {level}
        </p>
      </div>
    </div>
  );
};
