import { useNavigate } from "react-router-dom";
import { BombIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface GameOverProps {
  points: number;
  level: number;
}

export const GameOver = ({ points, level }: GameOverProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 max-w-[420px] mx-auto px-4 h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <BombIcon className="w-24 h-24 text-red-400" />
        <div className="flex flex-col gap-3">
          <h1 className="text-white uppercase text-3xl font-glitch">
            GAME OVER
          </h1>
          <p className="text-green-600 font-secondary text-sm tracking-wide max-w-xs">
            You ran out of health! Your final score was{" "}
            <span className="text-white font-bold">{points}</span> points on
            level {level}.
          </p>
        </div>
      </div>

      <div className="flex items-stretch gap-3 w-full pt-2">
        <Button
          variant="secondary"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={() => navigate("/games")}
        >
          ← GAMES
        </Button>
        <Button
          variant="default"
          className="min-h-14 flex-1 font-secondary text-sm tracking-widest"
          onClick={() => navigate("/")}
        >
          HOME
        </Button>
      </div>
    </div>
  );
};
