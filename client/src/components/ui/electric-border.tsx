import { useEffect, useMemo, useRef, useState } from "react";
import { MultiplierMath } from "@/helpers/multiplier";
import { cn } from "@/lib/utils";

export interface ElectricBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  gradient: string;
  borderGradient: string;
  seed?: number;
  animationFrames?: number;
  cornerRadius?: number;
  noisePoints?: number;
  noiseAmplitude?: number;
  borderWidth?: number;
  safetyMargin?: number;
  contentOpacity?: number;
  glowOpacity?: number;
}

export const ElectricBorder = ({
  children,
  color,
  gradient,
  borderGradient,
  seed = 100,
  animationFrames = 60,
  cornerRadius = 8,
  noisePoints = 128,
  noiseAmplitude = 0.15,
  borderWidth = 2,
  safetyMargin = 2,
  contentOpacity = 1,
  glowOpacity = 0.2,
  className,
  ...props
}: ElectricBorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Measure element dimensions to compute aspect ratio for uniform border
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (height > 0) setAspectRatio(width / height);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clipPathAnimation = useMemo(() => {
    const borderFrames: string[] = [];
    const contentFrames: string[] = [];

    for (let i = 0; i < animationFrames; i++) {
      const percentage = (i / (animationFrames - 1)) * 100;

      const ringClipPath = MultiplierMath.generateRingClipPath(
        i,
        seed,
        noiseAmplitude,
        borderWidth,
        noisePoints,
        safetyMargin,
        animationFrames,
        cornerRadius,
        aspectRatio,
      );
      borderFrames.push(
        `${percentage.toFixed(0)}% { clip-path: ${ringClipPath}; }`,
      );

      const contentClipPath = MultiplierMath.generateContentClipPath(
        i,
        seed,
        noiseAmplitude,
        noisePoints,
        safetyMargin,
        animationFrames,
        cornerRadius,
        aspectRatio,
      );
      contentFrames.push(
        `${percentage.toFixed(0)}% { clip-path: ${contentClipPath}; }`,
      );
    }

    const borderAnimationName = `electric-border-${seed}`;
    const contentAnimationName = `electric-content-${seed}`;

    return {
      borderName: borderAnimationName,
      contentName: contentAnimationName,
      keyframes: `
        @keyframes ${borderAnimationName} { ${borderFrames.join(" ")} }
        @keyframes ${contentAnimationName} { ${contentFrames.join(" ")} }
      `,
    };
  }, [
    seed,
    noiseAmplitude,
    borderWidth,
    noisePoints,
    safetyMargin,
    animationFrames,
    cornerRadius,
    aspectRatio,
  ]);

  return (
    <>
      <style>{clipPathAnimation.keyframes}</style>

      <div ref={containerRef} className={cn("relative", className)} {...props}>
        <div
          className="relative w-full h-full"
          style={
            {
              "--electric-color": color,
              "--electric-gradient": gradient,
              "--electric-border-gradient": borderGradient,
              padding: `${safetyMargin}%`,
            } as React.CSSProperties
          }
        >
          {/* Glow layer */}
          {glowOpacity > 0 && (
            <div
              className="absolute inset-0 blur-xl bg-[var(--electric-color)]"
              style={{ opacity: glowOpacity }}
            />
          )}

          {/* Content with synchronized clip-path */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "var(--electric-gradient)",
              animation: `${clipPathAnimation.contentName} 2s ease-in-out infinite`,
              opacity: contentOpacity,
            }}
          />

          {/* Animated border clip-path (on top of content) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundImage: "var(--electric-border-gradient)",
              boxShadow: "0 0 8px var(--electric-color)",
              animation: `${clipPathAnimation.borderName} 2s ease-in-out infinite`,
            }}
          />

          {/* Children on top */}
          <div className="relative z-20">{children}</div>
        </div>
      </div>
    </>
  );
};
