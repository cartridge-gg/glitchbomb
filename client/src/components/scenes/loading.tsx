import { GlitchText } from "@/components/ui/glitch-text";
import { cn } from "@/lib/utils";

export type LoadingSceneProps = React.HTMLAttributes<HTMLDivElement>;

export const LoadingScene = ({ className, ...props }: LoadingSceneProps) => {
  return (
    <div
      className={cn(
        "select-none flex flex-col items-center justify-center gap-3 h-full w-full",
        className,
      )}
      aria-busy="true"
      aria-label="Loading game"
      {...props}
    >
      <GlitchText
        text="LOADING"
        className="text-green-600 text-xs font-secondary tracking-[0.3em] uppercase"
        scramble
      />
      <div className="loading-screen-bar">
        <div className="loading-screen-bar-fill" />
      </div>
    </div>
  );
};
