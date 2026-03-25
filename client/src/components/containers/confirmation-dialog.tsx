import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/elements/loading-spinner";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onDismiss?: () => void;
  isConfirming?: boolean;
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "CONTINUE",
  onConfirm,
  onDismiss,
  isConfirming = false,
}: ConfirmationDialogProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      onDismiss?.();
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={isConfirming ? () => {} : onOpenChange}>
      <DialogContent className="w-[min(92vw,420px)] max-w-none border-4 border-[rgba(29,58,41,0.8)] bg-black p-6 gap-5">
        <div className="flex flex-col gap-5">
          <h2 className="text-green-400 font-secondary text-lg tracking-wider uppercase pr-6">
            {title}
          </h2>
          <p
            className="font-secondary text-sm tracking-wide"
            style={{ color: "rgba(54, 248, 24, 0.48)" }}
          >
            {description}
          </p>

          {/* Do not show again checkbox */}
          <button
            type="button"
            onClick={() => setDontShowAgain((v) => !v)}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div
              className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-200"
              style={{
                borderColor: dontShowAgain
                  ? "rgba(54, 248, 24, 0.6)"
                  : "rgba(54, 248, 24, 0.24)",
                backgroundColor: dontShowAgain
                  ? "rgba(54, 248, 24, 0.4)"
                  : "rgba(54, 248, 24, 0.24)",
              }}
            >
              {dontShowAgain && (
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-3 h-3 text-green-400"
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className="font-secondary text-xs tracking-wide"
              style={{ color: "rgba(54, 248, 24, 0.48)" }}
            >
              Do not show this again
            </span>
          </button>

          {/* Confirm button */}
          <Button
            gradient="green"
            className="h-12 w-full font-secondary uppercase text-sm tracking-widest"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? <LoadingSpinner size="sm" /> : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
