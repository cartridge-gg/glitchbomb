import type { ControllerConfig } from "@cartridge/presets";
import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  preset: string;
  name: string;
  config?: ControllerConfig;
  disabled?: boolean;
  hidden?: boolean;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

const bannerVariants = cva(
  "select-none relative rounded-xl flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 overflow-hidden bg-gradient-to-t from-[rgba(4,4,6,1)] to-[rgba(12,12,20,1)] shadow-[1px_1px_0px_0px_rgba(255,255,255,0.08)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
  {
    variants: {
      size: {
        md: "h-16 md:h-24 w-full shadow-[1px_1px_0px_0px_rgba(255,255,255,0.08)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function resolveImageUrl(value: unknown, size: number): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  if ("webp" in obj) {
    const svg = obj.svg as Record<number, string> | undefined;
    const png = obj.png as Record<number, string> | undefined;
    const jpg = obj.jpg as Record<number, string> | undefined;
    const webp = obj.webp as Record<number, string> | undefined;
    return svg?.[size] ?? png?.[size] ?? jpg?.[size] ?? webp?.[size];
  }
  if ("dark" in obj && typeof obj.dark === "object" && obj.dark !== null) {
    return resolveImageUrl(obj.dark, size);
  }
  return undefined;
}

export const Banner = (props: BannerProps) => {
  switch (props.name) {
    case "social":
      return <Social {...props} />;
    default:
      return <Game {...props} />;
  }
};

const Social = ({
  config,
  disabled,
  position,
  size,
  className,
  onClick,
  ...props
}: BannerProps) => {
  if (!config) return null;
  const theme = config.theme;
  const cover = resolveImageUrl(theme?.optimizedCover, 768);

  return (
    <div
      className={cn(
        bannerVariants({ size, className }),
        "bg-gradient-to-t from-transparent to-secondary-300 shadow-[1px_1px_0px_0px_rgba(255,255,255,0.12)_inset,1px_1px_0px_0px_rgba(0,0,0,0.12)]",
      )}
      {...props}
    >
      {cover && (
        <div className="absolute top-0 left-0 w-full h-full">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            style={{
              objectPosition:
                position !== undefined ? `center ${position}%` : "center",
            }}
          />
        </div>
      )}
      <div
        className="absolute top-0 left-0 h-full pr-8 md:pr-12 flex items-center gap-3 md:gap-4 px-4 md:px-6"
        style={{
          background:
            "linear-gradient(90deg, #000000 24%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        <div className="relative flex flex-col gap-1 md:gap-2 uppercase">
          <span
            className="text-sm/5 md:text-lg/5 text-primary-100"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Spread the word...
          </span>
          <strong
            className="text-xl/5 md:text-3xl/5 text-white-100 animate-glitch"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            Play for free!
          </strong>
        </div>
      </div>
      <div className="absolute right-4 md:right-6">
        <Button
          disabled={disabled}
          variant="muted"
          className="relative bg-primary-100 hover:bg-primary-200 px-3 py-1"
          onClick={onClick}
        >
          <p className={cn("text-base/3 font-primary")}>
            {onClick ? "Share!" : "Claimed!"}
          </p>
        </Button>
      </div>
    </div>
  );
};

const Game = ({
  config,
  position,
  origin: originOverride,
  onClick,
  size,
  className,
  ...props
}: BannerProps) => {
  if (!config) return null;

  const configOrigins = (
    Array.isArray(config.origin) ? config.origin : [config.origin]
  ).filter((o: string) => o !== "*");
  const rawOrigin = (originOverride ?? configOrigins[0] ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  const origin = `https://${rawOrigin}`;
  const theme = config.theme;
  const name = theme?.name ?? "Game";
  const icon = resolveImageUrl(theme?.optimizedIcon, 64) ?? theme?.icon;
  const cover = resolveImageUrl(theme?.optimizedCover, 768);
  const rawPrimary = theme?.colors?.primary;
  const primary =
    typeof rawPrimary === "string"
      ? rawPrimary
      : typeof rawPrimary === "object" && rawPrimary && "dark" in rawPrimary
        ? rawPrimary.dark
        : undefined;

  return (
    <div className={cn(bannerVariants({ size, className }))} {...props}>
      {cover && (
        <div className="absolute top-0 left-0 w-full h-full">
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            style={{
              objectPosition:
                position !== undefined ? `center ${position}%` : "center",
            }}
          />
        </div>
      )}
      <div
        className="absolute top-0 left-0 h-full pr-8 md:pr-12 flex items-center gap-3 md:gap-4 px-4 md:px-6"
        style={{
          background:
            "linear-gradient(90deg, #000000 24%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        {icon && (
          <img
            src={icon}
            alt={name}
            className="w-9 h-9 md:w-12 md:h-12 rounded-lg border-[3px] border-white-700"
          />
        )}
        <div className="flex flex-col gap-1 md:gap-2 uppercase">
          <span
            className="text-sm/3 md:text-lg/3 text-white-100/60"
            style={{
              textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)",
              color: primary ?? "rgba(255,255,255,0.2)",
            }}
          >
            Play
          </span>
          <strong
            className="text-base/4 md:text-2xl/4 text-white-100"
            style={{ textShadow: "2px 2px 0px rgba(0, 0, 0, 0.25)" }}
          >
            {name}
          </strong>
        </div>
      </div>
      <div className="absolute right-4 md:right-6 bg-black-100 p-1 rounded-xl">
        {onClick ? (
          <Button
            className="h-9 md:h-10 px-2 md:px-3 py-1 text-black-100 rounded-lg hover:opacity-80"
            style={{ backgroundColor: primary ?? "rgba(255,255,255,0.2)" }}
            onClick={onClick}
          >
            <p className="text-base/3 font-primary">Play</p>
          </Button>
        ) : (
          <Button
            asChild
            className="h-9 md:h-10 px-2 md:px-3 py-1 text-black-100 rounded-lg hover:opacity-80"
            style={{ backgroundColor: primary ?? "rgba(255,255,255,0.2)" }}
          >
            <Link to={origin} target="_blank">
              <p className="text-base/3 font-primary">Play</p>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
