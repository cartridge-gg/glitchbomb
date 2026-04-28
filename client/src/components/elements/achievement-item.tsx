import { cva, type VariantProps } from "class-variance-authority";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { ShadowEffect } from "../icons";
import { AchievementIcon } from "./achievement-icon";
import { AchievementProgress } from "./achievement-progress";
import { NotificationPing } from "./notification-ping";

export interface AchievementItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementItemVariants> {
  icon?: string;
  name?: string;
  count?: number;
  total?: number;
  selected?: boolean;
  hidden?: boolean;
  isNew?: boolean;
}

const achievementItemVariants = cva(
  "relative select-none flex flex-col justify-center items-center p-3 md:p-4 gap-3 rounded-lg h-[127px]",
  {
    variants: {
      variant: {
        default: "cursor-pointer md:cursor-default bg-white-900",
        complete: "cursor-pointer md:cursor-default bg-green-800",
        empty: "bg-black-800 border border-dashed border-white-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const AchievementItem = ({
  icon,
  name,
  count = 0,
  total = 0,
  selected = false,
  hidden = false,
  isNew,
  variant,
  className,
  ...props
}: AchievementItemProps) => {
  const filterId = useId();
  const isEmpty = !icon && !name;
  const resolvedVariant = isEmpty ? "empty" : variant;
  const isComplete = resolvedVariant === "complete";

  if (isEmpty) {
    return (
      <div
        className={cn(achievementItemVariants({ variant: "empty", className }))}
        {...props}
      />
    );
  }

  return (
    <div
      className={achievementItemVariants({
        variant: resolvedVariant,
        className,
      })}
      {...props}
    >
      {isNew && <NotificationPing />}
      {selected && (
        <div className="absolute inset-0 rounded-lg outline outline-2 outline-white-100 md:hidden" />
      )}
      <AchievementIcon
        icon={hidden ? "fa-trophy" : (icon ?? "")}
        className={isComplete ? "text-green-100" : "text-white-400"}
      />

      <ShadowEffect filterId={filterId} />
      <p
        className={cn(
          "font-secondary text-[22px]/3 text-center whitespace-nowrap max-w-full",
          isComplete ? "text-green-100" : "text-white-400",
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        {hidden ? "Hidden" : name}
      </p>

      {!hidden && count > 0 && !isComplete && (
        <AchievementProgress
          count={count}
          total={total}
          variant={isComplete ? "complete" : "default"}
          className="self-stretch"
        />
      )}
    </div>
  );
};
