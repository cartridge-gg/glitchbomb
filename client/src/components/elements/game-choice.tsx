import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";
import { MoonrockIcon } from "../icons";
import { Button } from "../ui/button";
import { LoadingSpinner } from "./loading-spinner";

export interface ChoiceDetail {
  category: "curse" | "chips" | "moonrocks";
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
}

export interface gameChoiceProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gameChoiceVariants> {
  value: number;
  details: ChoiceDetail[];
  loading?: boolean;
  [dataAttr: `data-${string}`]: string | undefined;
}

const gameChoiceVariants = cva(
  "p-3 rounded-lg border flex flex-col gap-2 w-full h-auto",
  {
    variants: {
      variant: {
        default:
          "text-primary-100 bg-primary-600 hover:bg-primary-500 border-t-primary-700 border-y-primary-800 border-b-transparent",
        secondary:
          "text-secondary-100 bg-secondary-600 hover:bg-secondary-500 border-t-secondary-700 border-y-secondary-800 border-b-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const GameChoice = ({
  value,
  details,
  loading = false,
  variant,
  className,
  ...props
}: gameChoiceProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(gameChoiceVariants({ variant, className }))}
      {...props}
    >
      <div className="flex justify-between items-center w-full">
        <strong className="font-secondary text-xl pl-1">
          {variant === "secondary" ? "Cash Out" : "Continue"}
        </strong>
        <div className="flex gap-px items-center rounded overflow-hidden text-secondary-100">
          <p className="bg-black-800 font-secondary text-base px-3 py-2">
            {variant === "secondary" ? "Value" : "Ante"}
          </p>
          {variant === "secondary" ? (
            <UsdValue value={value} />
          ) : (
            <MoonrockValue value={value} />
          )}
        </div>
      </div>
      <div className="grow flex gap-3 items-stretch w-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-2 rounded bg-black-700 text-white-100">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          details.map((detail) => (
            <div
              key={detail.label}
              className={cn(
                "flex-1 flex flex-col justify-center items-center gap-2 p-2 rounded bg-black-700 text-white-100",
                detail.category === "chips" ? "text-orange-100" : "",
                detail.category === "moonrocks" ? "text-yellow-100" : "",
                detail.className,
              )}
            >
              <div className="flex items-center gap-1">
                {detail.icon}
                <p className="px-0.5 text-xl font-secondary">{detail.value}</p>
              </div>
              <p className="opacity-50 font-secondary text-base">
                {detail.label}
              </p>
            </div>
          ))
        )}
      </div>
    </Button>
  );
};

const MoonrockValue = ({ value }: { value: number }) => {
  return (
    <p className="bg-black-800 font-secondary text-base px-3 py-2 flex items-center gap-1">
      <MoonrockIcon size="md" />
      <span className="font-secondary text-base">{`-${value}`}</span>
    </p>
  );
};

const UsdValue = ({ value }: { value: number }) => {
  return (
    <p className="bg-black-800 font-secondary text-base px-3 py-2 flex items-center gap-1">
      <span className="font-secondary text-base">{`~$${value.toFixed(2)}`}</span>
    </p>
  );
};
