import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  QuestNode,
  type QuestNodeProps,
} from "@/components/elements/quest-node";
import { cn } from "@/lib/utils";

const questNodesVariants = cva(
  "relative flex justify-between items-center w-full flex-1 gap-4",
  {
    variants: {
      variant: {
        default: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface QuestNodesProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof questNodesVariants> {
  nodes: QuestNodeProps[];
}

const PROGRESS_DURATION_MS = 600;
const SCALE_DURATION_MS = 180;

const getLastCompletedIndex = (nodes: QuestNodeProps[]): number => {
  let lastCompletedIndex = -1;
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].completed) lastCompletedIndex = i;
  }
  return lastCompletedIndex;
};

export const QuestNodes = ({
  nodes,
  variant,
  className,
  ...props
}: QuestNodesProps) => {
  const lastCompletedIndex = useMemo(
    () => getLastCompletedIndex(nodes),
    [nodes],
  );

  const progress = useMemo(() => {
    if (nodes.length < 2 || lastCompletedIndex < 0) return 0;
    return (lastCompletedIndex / (nodes.length - 1)) * 100;
  }, [nodes.length, lastCompletedIndex]);

  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setRevealedCount(0);
    if (lastCompletedIndex < 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= lastCompletedIndex; i += 1) {
      const ratio = lastCompletedIndex === 0 ? 0 : i / lastCompletedIndex;
      const delay = ratio * PROGRESS_DURATION_MS;
      timers.push(
        setTimeout(() => {
          setRevealedCount((current) => Math.max(current, i + 1));
        }, delay),
      );
    }

    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, [lastCompletedIndex]);

  return (
    <div className={cn(questNodesVariants({ variant, className }))} {...props}>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-white-900 overflow-hidden">
        <motion.div
          className="h-full bg-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: PROGRESS_DURATION_MS / 1000,
            ease: "easeOut",
          }}
        />
      </div>
      {nodes.map((node, index) => {
        const isCompleted = Boolean(node.completed) && index < revealedCount;
        const displayVariant = node.variant ?? "default";
        return (
          <motion.div
            key={`quest-node-${index}-${displayVariant}`}
            animate={{
              scale: isCompleted && node.completed ? [1, 1.25, 1] : 1,
            }}
            transition={{ duration: SCALE_DURATION_MS / 1000, ease: "easeOut" }}
            className={cn(
              "relative bg-black-100 flex items-center justify-center rounded-full w-10 h-10",
            )}
          >
            <QuestNode {...node} completed={isCompleted} />
          </motion.div>
        );
      })}
    </div>
  );
};
