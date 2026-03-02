import { cn } from "@/lib/utils";

export interface CardDividerProps {
  className?: string;
}

export const CardDivider = ({ className }: CardDividerProps) => (
  <div className={cn("h-px opacity-5", className)} />
);
