import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface TabBarItem<T extends string> {
  id: T;
  label?: string;
  Icon: ComponentType<{ className?: string }>;
}

export interface TabBarProps<T extends string> {
  items: TabBarItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
}

export const TabBar = <T extends string>({
  items,
  active,
  onChange,
  className,
  buttonClassName,
  iconClassName,
  labelClassName,
}: TabBarProps<T>) => (
  <div
    className={cn(
      "flex gap-0 p-1 bg-green-900 rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
      className,
    )}
  >
    {items.map((item) => {
      const isActive = item.id === active;
      const Icon = item.Icon;

      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "group flex-1 flex items-center justify-center gap-2 rounded-none transition-colors py-2 first:rounded-l-lg last:rounded-r-lg",
            isActive
              ? "bg-green-950"
              : "bg-green-1000 hover:bg-green-950/80",
            buttonClassName,
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4 transition-colors",
              isActive
                ? "text-green-400"
                : "text-green-600 opacity-70 group-hover:text-green-500 group-hover:opacity-100",
              iconClassName,
            )}
          />
          {item.label ? (
            <span
              className={cn(
                "font-secondary text-[clamp(0.6rem,1.4svh,0.75rem)] tracking-widest transition-colors",
                isActive
                  ? "text-green-400"
                  : "text-green-600 opacity-70 group-hover:text-green-500 group-hover:opacity-100",
                labelClassName,
              )}
            >
              {item.label}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);
