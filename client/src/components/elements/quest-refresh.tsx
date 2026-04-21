import { cva, type VariantProps } from "class-variance-authority";

const questRefreshVariants = cva("flex items-center", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface QuestRefreshProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questRefreshVariants> {
  timeLeft: string;
}

export const QuestRefresh = ({
  timeLeft,
  variant,
  className,
  ...props
}: QuestRefreshProps) => {
  return (
    <div className={questRefreshVariants({ variant, className })} {...props}>
      <p>
        <span className="font-secondary text-2xl/6 text-yellow">
          <span className="font-inherit">New quests in: </span>
          <span className="font-inherit">{timeLeft}</span>
        </span>
      </p>
    </div>
  );
};
