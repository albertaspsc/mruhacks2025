"use client";

import React, { useEffect, useRef } from "react";

/**
 * StaticNoiseOverlay
 * Lightweight canvas-based noise overlay approximating the subtle "TV static" effect.
 * - Renders a low-res noise buffer and scales it up for performance.
 * - Updates at ~12fps (adjust via FRAME_INTERVAL) to reduce CPU/GPU use.
 * - Respects prefers-reduced-motion: reduces frame rate + opacity.
 */
export const StaticNoiseOverlay: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className, opacity = 0.22 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const REDUCED = mediaQuery.matches;

    const BASE_SIZE = 360;
    const FRAME_INTERVAL = REDUCED ? 180 : 70;

    const resize = () => {
      canvas.width = BASE_SIZE;
      canvas.height = BASE_SIZE;
    };
    resize();

    const draw = (time: number) => {
      if (time - lastFrameRef.current < FRAME_INTERVAL) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      lastFrameRef.current = time;

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = Math.random();
        // base noise luminance
        const v = r < 0.08 ? 70 + Math.random() * 60 : 185 + Math.random() * 70; // deeper lows & highs
        data[i] = data[i + 1] = data[i + 2] = v;
        // stronger alpha overall
        data[i + 3] = 90 + Math.random() * 130; // 90-220
      }
      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const baseStyle: React.CSSProperties = {
    opacity,
    width: "100%",
    height: "100%",
    imageRendering: "pixelated",
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
  };

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ ...baseStyle, mixBlendMode: "overlay" }}
    />
  );
};

export default StaticNoiseOverlay;
