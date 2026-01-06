import { cva, type VariantProps } from "class-variance-authority";
import { Item } from "@/components/elements";
import type { Orb } from "@/models";
import { ChipIcon } from "../icons";
import { Button } from "../ui/button";

export interface GameShopProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameShopVariants> {
  balance: number;
  orbs: Orb[];
  onSubmit: () => void;
  onInventory: () => void;
  onContinue: () => void;
}

const gameShopVariants = cva("select-none relative flex flex-col gap-5", {
  variants: {
    variant: {
      default: "max-h-96",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameShop = ({
  balance,
  orbs,
  variant,
  className,
  onSubmit,
  onInventory,
  onContinue,
  ...props
}: GameShopProps) => {
  return (
    <div className={gameShopVariants({ variant, className })} {...props}>
      <div className="flex items-center justify-between">
        <h1 className="text-white uppercase text-3xl/[22px]">Orb Shop</h1>
        <div className="px-2.5 pl-1.5 h-[22px] flex items-center gap-0.5 text-black bg-orange-100 rounded border border-orange-300">
          <div className="relative min-h-4 min-w-4">
            <ChipIcon
              size="md"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <div className="flex items-center justify-center gap-0.5">
            <span className="text-[8px] font-secondary opacity-50">x</span>
            <strong className="text-sm tracking-widest font-secondary">
              {balance}
            </strong>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col gap-2 grow overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {orbs.map((orb, index) => {
          const key = `${orb.value}-${index}`;
          return (
            <Item
              key={key}
              title={orb.name()}
              description={orb.description()}
              cost={orb.cost()}
              variant={
                orb.isBomb()
                  ? "bomb"
                  : orb.isHealth()
                    ? "health"
                    : orb.isMultiplier()
                      ? "multiplier"
                      : orb.isPoint()
                        ? "point"
                        : orb.isMoonrock()
                          ? "moonrock"
                          : orb.isChips()
                            ? "chip"
                            : "default"
              }
            />
          );
        })}
      </div>
      <div className="flex items-stretch gap-3 w-full">
        <Button
          variant="secondary"
          className="min-h-12 flex-1 font-secondary text-sm tracking-widest"
          onClick={onSubmit}
        >
          Submit
        </Button>
        <Button
          variant="secondary"
          className="min-h-12 font-secondary text-sm tracking-widest"
          onClick={onInventory}
        >
          Bag
        </Button>
        <Button
          variant="secondary"
          className="min-h-12 flex-1 font-secondary text-sm tracking-widest"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
