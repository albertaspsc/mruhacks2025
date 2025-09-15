import React from "react";
import styles from "./GradientBackground.module.css";

/**
 * StaticNoiseOverlay
 * CSS-based noise overlay approximating the subtle "TV static" effect.
 * - Uses a pre-generated noise pattern as CSS background-image
 * - Animated with CSS transforms for subtle movement
 * - Respects prefers-reduced-motion: reduces animation + opacity
 * - Server component compatible (no client-side JavaScript)
 */

export const StaticNoiseOverlay: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className, opacity = 0.4 }) => {
  const baseStyle: React.CSSProperties = {
    opacity,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    background: `
      repeating-radial-gradient(rgba(0,0,0,0.1) 0 0.0001%, rgba(255,255,255,0.5) 0 0.0002%) 50% 0 / 2500px 2500px,
      repeating-conic-gradient(#000 0 0.0001%, #fff 0 0.0002%) 60% 60% / 2500px 2500px
    `,
    backgroundBlendMode: "overlay",
    imageRendering: "pixelated",
  };

  return (
    <div
      aria-hidden
      className={`${styles.staticNoise} ${className || ""}`}
      style={baseStyle}
    />
  );
};

export default StaticNoiseOverlay;
