import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { TimerIcon } from "@/components/icons/regulars/timer";
import { Formatter } from "@/helpers";
import { cn } from "@/lib/utils";

export interface QuestRefreshProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questRefreshVariants> {
  expiration: number;
}

const questRefreshVariants = cva("select-none flex items-center gap-0.5", {
  variants: {
    variant: {
      default: "text-yellow-100 bg-yellow-900 px-1.5 py-1 rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const getCountdown = (exp: number) => {
  if (!exp) return Formatter.countdown(0);
  const now = new Date();
  const diff = exp * 1000 - now.getTime();
  return Formatter.countdown(diff);
};

export const QuestRefresh = ({
  expiration,
  variant,
  className,
  ...props
}: QuestRefreshProps) => {
  const [countdown, setCountdown] = useState<string>(() =>
    getCountdown(expiration),
  );

  useEffect(() => {
    setCountdown(getCountdown(expiration));
    if (!expiration) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiration * 1000 - now.getTime();
      setCountdown(Formatter.countdown(diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiration]);

  return (
    <div
      className={cn(questRefreshVariants({ variant, className }))}
      {...props}
    >
      <TimerIcon size="md" className="shrink-0" />
      <p className="font-secondary text-2xl/[13px] px-1">{countdown}</p>
    </div>
  );
};
