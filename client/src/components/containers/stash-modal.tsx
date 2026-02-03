import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Orb } from "@/models";
import { GameStash } from "./game-stash";

export interface StashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orbs: Orb[];
  discards?: boolean[];
}

export const StashModal = ({
  open,
  onOpenChange,
  orbs,
  discards,
}: StashModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-[min(92vw,420px)] max-w-none border-2 border-[rgba(29,58,41,0.8)] bg-black p-0 h-[min(85vh,600px)] max-h-[85vh] overflow-hidden">
      <GameStash orbs={orbs} discards={discards} />
    </DialogContent>
  </Dialog>
);
