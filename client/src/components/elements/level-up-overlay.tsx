import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { GlitchText } from "@/components/ui/glitch-text";

const AUTO_DISMISS_MS = 2500;

export type LevelUpVariant = "complete" | "enter";

export interface LevelUpOverlayProps {
  open: boolean;
  level: number;
  variant: LevelUpVariant;
  onDismiss: () => void;
  children?: ReactNode;
}

const CONFIG: Record<
  LevelUpVariant,
  { label: (level: number) => string; color: string; glow: string }
> = {
  complete: {
    label: (level) => `LEVEL ${level}`,
    color: "text-green-400",
    glow: "rgba(74, 222, 128, 0.4)",
  },
  enter: {
    label: (level) => `LEVEL ${level}`,
    color: "text-purple-400",
    glow: "rgba(192, 132, 252, 0.4)",
  },
};

export const LevelUpOverlay = ({
  open,
  level,
  variant,
  onDismiss,
  children,
}: LevelUpOverlayProps) => {
  const cfg = CONFIG[variant];
  const hasChoice = Boolean(children);

  // Auto-dismiss only when there's no choice to make
  useEffect(() => {
    if (!open || hasChoice) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [open, onDismiss, hasChoice]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto backdrop-blur-md"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // Only click-to-dismiss when there's no choice
          onClick={hasChoice ? undefined : onDismiss}
        >
          {/* Title section */}
          <div className="flex flex-col items-center gap-4">
            {/* Decorative line */}
            <motion.div
              className={`h-px bg-gradient-to-r from-transparent ${variant === "complete" ? "via-green-400" : "via-purple-400"} to-transparent`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 0.6 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            />

            {/* Subtitle */}
            <motion.p
              className={`font-secondary text-[clamp(0.7rem,1.6svh,1rem)] tracking-[0.5em] ${cfg.color} opacity-80`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              {variant === "complete" ? "COMPLETE" : "ENTERING"}
            </motion.p>

            {/* Level label */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <GlitchText
                className={`font-secondary text-[clamp(2rem,7svh,4rem)] tracking-[0.2em] ${cfg.color}`}
                style={{
                  textShadow: `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow.replace("0.4", "0.2")}`,
                }}
                text={cfg.label(level)}
              />
            </motion.div>

            {/* Decorative line */}
            <motion.div
              className={`h-px bg-gradient-to-r from-transparent ${variant === "complete" ? "via-green-400" : "via-purple-400"} to-transparent`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 0.6 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Choice content */}
          {hasChoice && (
            <motion.div
              className="w-full max-w-[420px] px-4 pb-[clamp(16px,3svh,32px)] mt-[clamp(16px,3svh,28px)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
