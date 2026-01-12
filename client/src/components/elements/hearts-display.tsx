import { HeartIcon } from "@/components/icons";

export interface HeartsDisplayProps {
  health: number;
  maxHealth?: number;
  className?: string;
}

export const HeartsDisplay = ({
  health,
  maxHealth = 5,
  className = "",
}: HeartsDisplayProps) => {
  return (
    <div
      className={`flex items-center gap-0.5 border border-green-900 rounded-lg px-2 py-1.5 ${className}`}
    >
      {Array.from({ length: maxHealth }).map((_, i) => (
        <HeartIcon
          key={i}
          className="w-6 h-6"
          style={
            i < health
              ? {
                  color: "#FF0080",
                  filter: "drop-shadow(0 0 4px #FF0080)",
                }
              : {
                  color: "rgba(20, 83, 45, 0.3)",
                }
          }
        />
      ))}
    </div>
  );
};
