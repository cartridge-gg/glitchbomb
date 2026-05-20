import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { CheckIcon, GiftIcon, GiftUsedIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface QuestNodeProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof questNodeVariants> {
  completed?: boolean;
}

const questNodeVariants = cva(
  "select-none rounded-full flex items-center justify-center h-8 w-8 p-0 data-[interactive=true]:cursor-pointer disabled:opacity-100",
  {
    variants: {
      variant: {
        default: [
          "border-2 border-white-800 bg-black-100 data-[completed=false]:w-4 data-[completed=false]:h-4",
          "data-[completed=true]:m-0 data-[completed=true]:border-0",
          "data-[completed=true]:bg-primary-800 data-[completed=true]:text-primary-100",
        ],
        gift: [
          "bg-white-900",
          "data-[completed=true]:bg-primary-800 data-[completed=true]:text-primary-100",
          "data-[completed=true]:data-[interactive=true]:hover:bg-primary-700",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const QuestNode = ({
  completed = false,
  variant,
  onClick,
  className,
  ...props
}: QuestNodeProps) => {
  const interactive = Boolean(onClick);

  return (
    <Button
      variant="ghost"
      disabled={!interactive}
      data-completed={completed}
      data-interactive={interactive}
      className={cn(questNodeVariants({ variant, className }))}
      onClick={onClick}
      {...props}
    >
      {variant === "default" && completed && (
        <CheckIcon size="md" className="text-primary-100" />
      )}
      {variant === "gift" && !completed && (
        <GiftIcon size="md" className="text-white-400" />
      )}
      {variant === "gift" && completed && interactive && (
        <motion.div
          animate={{ rotate: [0, -12, 12, -8, 8, -4, 4, 0] }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 1.2,
          }}
          className="flex"
        >
          <GiftIcon size="md" className="text-primary-100" />
        </motion.div>
      )}
      {variant === "gift" && completed && !interactive && (
        <GiftUsedIcon size="md" className="text-primary-100" />
      )}
    </Button>
  );
};
