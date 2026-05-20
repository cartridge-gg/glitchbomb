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

const questRefreshVariants = cva("select-none flex items-center gap-2 h-10", {
  variants: {
    variant: {
      default: "",
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
      <TimerIcon size="md" className="text-[#FFF121] shrink-0" />
      <p
        className="font-secondary text-2xl/4 text-yellow-100"
        style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.24)" }}
      >
        {countdown}
      </p>
    </div>
  );
};
