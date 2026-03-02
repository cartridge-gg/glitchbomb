import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Orb } from "./orb";

export interface RewardItem {
  variant: "moonrock" | "chip" | "point" | "multiplier";
  count: number;
  label: string;
}

export interface RewardOverlayProps {
  open: boolean;
  onDismiss: () => void;
  heading?: string;
  actionLabel?: string;
  reward: RewardItem;
}

export const RewardOverlay = ({
  open,
  onDismiss,
  heading = "YOU RECEIVE",
  actionLabel = "TAKE ALL",
  reward,
}: RewardOverlayProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Heading */}
            <motion.p
              className="font-secondary text-sm tracking-[0.3em]"
              style={{ color: "#FFF121" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {heading}
            </motion.p>

            {/* Stacked orb icons — two coins */}
            <motion.div
              className="relative w-32 h-32"
              style={
                {
                  "--orb-moonrock": "var(--yellow-100)",
                } as React.CSSProperties
              }
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {/* Back orb — offset slightly right and down */}
              <div className="absolute top-1/2 left-1/2 -translate-x-[46%] -translate-y-[48%] opacity-60">
                <Orb variant={reward.variant} className="scale-[0.44]" />
              </div>
              {/* Front orb with black border */}
              <div className="absolute top-1/2 left-1/2 -translate-x-[54%] -translate-y-[52%]">
                <Orb
                  variant={reward.variant}
                  className="scale-[0.44]"
                  style={{
                    boxShadow: "0 0 0 12px black",
                    borderRadius: "9999px",
                  }}
                />
              </div>
            </motion.div>

            {/* Count + label pill */}
            <motion.div
              className="flex items-center gap-2 rounded-full px-5 py-2"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.20)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span
                className="font-secondary text-lg tracking-widest font-bold"
                style={{ color: "#FFF121" }}
              >
                {reward.count}
              </span>
              <span
                className="font-secondary text-lg tracking-widest"
                style={{ color: "#FFF121" }}
              >
                {reward.label}
              </span>
            </motion.div>

            {/* TAKE ALL button — matches homepage style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <Button
                variant="secondary"
                gradient="green"
                className="h-12 px-12 font-secondary uppercase text-sm tracking-widest"
                onClick={onDismiss}
              >
                {actionLabel}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
