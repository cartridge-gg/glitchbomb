import { cva, type VariantProps } from "class-variance-authority";
import { useId } from "react";
import { LoadingSpinner } from "@/components/elements/loading-spinner";
import { BombIcon, PlusIcon, ShadowEffect } from "@/components/icons";
import { ElectricBorder } from "@/components/ui/electric-border";
import { cn } from "@/lib/utils";

export interface GameCardField {
  label: string;
  value: string;
}

export interface GameCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof gameCardVariants> {
  fields: GameCardField[];
  loading?: boolean;
  seed?: number;
  onClick?: () => void;
}

const gameCardVariants = cva("rounded-md", {
  variants: {
    variant: {
      active: "",
      new: "",
    },
  },
  defaultVariants: {
    variant: "active",
  },
});

interface VariantTheme {
  color: string;
  gradient: string;
  borderGradient: string;
  labelColor: string;
  valueColor: string;
}

const VARIANT_THEME: Record<
  NonNullable<GameCardProps["variant"]>,
  VariantTheme
> = {
  active: {
    color: "var(--green-100)",
    gradient: "linear-gradient(0deg, var(--green-700), var(--green-700))",
    borderGradient: "linear-gradient(0deg, var(--green-100), var(--green-100))",
    labelColor: "var(--green-400)",
    valueColor: "var(--green-100)",
  },
  new: {
    color: "var(--tertiary-100)",
    gradient: "linear-gradient(0deg, var(--tertiary-700), var(--tertiary-700))",
    borderGradient:
      "linear-gradient(0deg, var(--tertiary-100), var(--tertiary-100))",
    labelColor: "var(--tertiary-400)",
    valueColor: "var(--tertiary-100)",
  },
};

export const GameCard = ({
  fields,
  loading,
  seed = 42,
  onClick,
  variant,
  className,
  ...props
}: GameCardProps) => {
  const resolvedVariant = variant ?? "active";
  const theme = VARIANT_THEME[resolvedVariant];
  const filterId = useId();

  return (
    <div className={cn(gameCardVariants({ variant, className }))} {...props}>
      <ElectricBorder
        color={theme.color}
        gradient={theme.gradient}
        borderGradient={theme.borderGradient}
        seed={seed}
        cornerRadius={3}
        noiseAmplitude={0.15}
        borderWidth={2}
        safetyMargin={1}
        noisePoints={400}
        noiseFrequency={20}
        glowOpacity={0}
        className="rounded-md"
      >
        <ShadowEffect filterId={filterId} />
        <button
          type="button"
          className="w-full px-3 py-1.5 flex items-center gap-3 text-left cursor-pointer"
          onClick={onClick}
        >
          <div className="shrink-0 self-stretch flex items-center justify-center rounded bg-white-900 px-2">
            {resolvedVariant === "new" ? (
              <PlusIcon
                size="md"
                className="text-tertiary-100"
                style={{ filter: `url(#${filterId})` }}
              />
            ) : (
              <BombIcon
                size="md"
                className="text-primary-100"
                style={{ filter: `url(#${filterId})` }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {fields.map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <p
                    className="font-secondary text-base leading-none"
                    style={{ color: theme.labelColor }}
                  >
                    {field.label}
                  </p>
                  <p
                    className="font-secondary text-xl uppercase leading-none"
                    style={{ color: theme.valueColor }}
                  >
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {loading && <LoadingSpinner size="sm" />}
        </button>
      </ElectricBorder>
    </div>
  );
};
