import { cva, type VariantProps } from "class-variance-authority";
import {
  Distribution,
  type DistributionValues,
  Puller,
} from "@/components/elements";

export interface GameSceneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameSceneVariants> {
  lives: number;
  orbs: number;
  values: DistributionValues;
  onPull: () => void;
}

const gameSceneVariants = cva("relative", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const GameScene = ({
  lives,
  orbs,
  values,
  variant,
  className,
  onPull,
  ...props
}: GameSceneProps) => {
  return (
    <div className={gameSceneVariants({ variant, className })} {...props}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Distribution values={values} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Puller
          className="h-[250px] w-[250px]"
          onClick={onPull}
          variant={
            lives < 2
              ? "bomb"
              : lives < 4
                ? "multiplier"
                : lives < 5
                  ? "default"
                  : "point"
          }
          orbs={orbs}
          lives={lives}
        />
      </div>
    </div>
  );
};
