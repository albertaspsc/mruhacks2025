"use client";

import React, { useEffect, useRef } from "react";
import styles from "./GradientBackground.module.css";
import StaticNoiseOverlay from "./StaticNoiseOverlay";

interface Props {}

/**
 * GradientBackground
 * Renders an interactive CSS gradient background with noise overlay.
 */
export const GradientBackground: React.FC<Props> = () => {
  const mouseRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for interactive gradient
  useEffect(() => {
    if (!mouseRef.current) return;

    const interactiveElement = mouseRef.current;
    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      interactiveElement.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };

    const handleMouseMove = (event: MouseEvent) => {
      tgX = event.clientX;
      tgY = event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    move();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const renderGradient = () => {
    return (
      <div
        className={styles.interactive + " " + styles.gradientBase}
        aria-hidden
      >
        <div className={styles.interactiveGradients}>
          <div
            className={styles.interactiveCircle + " " + styles.interactiveG1}
          />
          <div
            className={styles.interactiveCircle + " " + styles.interactiveG2}
          />
          <div
            className={styles.interactiveCircle + " " + styles.interactiveG3}
          />
          <div
            className={styles.interactiveCircle + " " + styles.interactiveG4}
          />
          <div
            className={styles.interactiveCircle + " " + styles.interactiveG5}
          />
          <div ref={mouseRef} className={styles.interactiveMouse} />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layered} aria-hidden>
      {renderGradient()}
      <StaticNoiseOverlay className={styles.noiseOverlay} />
    </div>
  );
};

export default GradientBackground;
