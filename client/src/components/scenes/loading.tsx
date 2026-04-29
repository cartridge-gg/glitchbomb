import { cn } from "@/lib/utils";

export interface LoadingSceneProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LoadingScene = ({ className, ...props }: LoadingSceneProps) => {
  return (
    <div
      className={cn(
        "select-none flex items-center justify-center h-full w-full",
        className,
      )}
      aria-busy="true"
      aria-label="Loading game"
      {...props}
    />
  );
};
