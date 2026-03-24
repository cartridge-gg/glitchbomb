import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { GlitchText } from "@/components/ui/glitch-text";

const AUTO_DISMISS_MS = 2500;

export type LevelUpVariant = "complete" | "enter";

export interface LevelUpOverlayProps {
  open: boolean;
  level: number;
  variant: LevelUpVariant;
  onDismiss: () => void;
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
}: LevelUpOverlayProps) => {
  const cfg = CONFIG[variant];

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDismiss}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Decorative line */}
            <motion.div
              className={`h-px bg-gradient-to-r from-transparent ${variant === "complete" ? "via-green-400" : "via-purple-400"} to-transparent`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 0.6 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            />

            {/* Level label */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.15,
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

            {/* Subtitle */}
            <motion.p
              className={`font-secondary text-[clamp(0.7rem,1.6svh,1rem)] tracking-[0.5em] ${cfg.color} opacity-80`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {variant === "complete" ? "COMPLETE" : "ENTERING"}
            </motion.p>

            {/* Decorative line */}
            <motion.div
              className={`h-px bg-gradient-to-r from-transparent ${variant === "complete" ? "via-green-400" : "via-purple-400"} to-transparent`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 0.6 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
