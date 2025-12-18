import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const SCALE = 15;

export interface MultiplierProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof multiplierVariants> {
	count: number;
	color: "green" | "orange" | "red";
}

export const multiplierVariants = cva(
	"relative flex items-center justify-center rounded-lg transition-all",
	{
		variants: {
			variant: {
				default: "font-bold",
			},
			size: {
				md: "size-20 text-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

export const Multiplier = ({
	count,
	variant,
	size,
	color,
	className,
	...props
}: MultiplierProps) => {
	const cssColor = useMemo(() => {
		switch (color) {
			case "green":
				return "var(--green-100)";
			case "orange":
				return "var(--orange-100)";
			case "red":
				return "var(--red-100)";
		}
	}, [color]);

	return (
		<div
			className="relative inline-flex items-center justify-center p-[2px]"
			style={{ "--electric-color": cssColor } as React.CSSProperties}
		>
			{/* 1. SVG Filter: Creates the erratic distortion effect */}
			<svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
				<defs>
					<filter
						id="electric-displace"
						colorInterpolationFilters="sRGB"
						x="-20%"
						y="-20%"
						width="140%"
						height="140%"
					>
						<feTurbulence
							type="turbulence"
							baseFrequency="0.02"
							numOctaves="10"
							result="noise1"
							seed="3"
						/>
						<feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
							<animate
								attributeName="dy"
								values="152; 0"
								dur="2s"
								repeatCount="indefinite"
								calcMode="radial"
							/>
						</feOffset>

						<feTurbulence
							type="turbulence"
							baseFrequency="0.02"
							numOctaves="10"
							result="noise2"
							seed="3"
						/>
						<feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
							<animate
								attributeName="dy"
								values="0; -152"
								dur="2s"
								repeatCount="indefinite"
								calcMode="radial"
							/>
						</feOffset>

						<feTurbulence
							type="turbulence"
							baseFrequency="0.02"
							numOctaves="10"
							result="noise1"
							seed="3"
						/>
						<feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
							<animate
								attributeName="dx"
								values="152; 0"
								dur="2s"
								repeatCount="indefinite"
								calcMode="radial"
							/>
						</feOffset>

						<feTurbulence
							type="turbulence"
							baseFrequency="0.02"
							numOctaves="10"
							result="noise2"
							seed="3"
						/>
						<feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
							<animate
								attributeName="dx"
								values="0; -152"
								dur="2s"
								repeatCount="indefinite"
								calcMode="radial"
							/>
						</feOffset>

						<feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
						<feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
						<feBlend
							in="part1"
							in2="part2"
							mode="color-dodge"
							result="combinedNoise"
						/>

						<feDisplacementMap
							in="SourceGraphic"
							in2="combinedNoise"
							scale="15"
							xChannelSelector="R"
							yChannelSelector="B"
						/>
					</filter>
				</defs>
			</svg>

			{/* 2. Glow Layers */}
			<div className="absolute inset-0 rounded-lg opacity-20 blur-md bg-[var(--electric-color)]" />
			<div className="absolute inset-0 rounded-lg opacity-20 blur-xl bg-[var(--electric-color)]" />

			{/* 3. Distorted Electric Border */}
			<div
				className="absolute inset-0 border-[3px] rounded-lg pointer-events-none"
				style={{
					borderColor: "var(--electric-color)",
					filter: "url(#electric-displace)",
					boxShadow: `0 0 8px var(--electric-color)`,
					// Minor manual adjustment to perfectly center the distorted box
					transform: `translate(-${SCALE / 6}px, -${SCALE / 6}px)`,
				}}
			/>

			{/* 4. Component Content */}
			<div
				className={cn(
					multiplierVariants({ variant, size, className }),
					"relative z-10",
				)}
				{...props}
			>
				<p
					className="font-secondary tracking-widest"
					style={{ color: "var(--electric-color)" }}
				>{`${count}X`}</p>
			</div>
		</div>
	);
};
