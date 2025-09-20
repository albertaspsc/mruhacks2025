"use client";

import React, { useEffect, useState } from "react";
import { GradientBackground } from "./GradientBackground";
import styles from "./GradientBackground.module.css";

interface Props {}

/**
 * DeferredGradientBackground
 * Renders a static gradient first, then loads the animated version after initial render
 * to improve perceived performance on slow networks
 */
export const DeferredGradientBackground: React.FC<Props> = () => {
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState(false);

  useEffect(() => {
    // Load animation after initial render and when browser is idle
    const loadAnimation = () => {
      setShouldLoadAnimation(true);
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(loadAnimation, { timeout: 2000 });
    } else {
      setTimeout(loadAnimation, 100);
    }
  }, []);

  return (
    <div className={styles.layered} aria-hidden>
      {shouldLoadAnimation ? (
        <GradientBackground />
      ) : (
        // Static gradient fallback for immediate rendering
        <div
          className={styles.gradientBase}
          style={{
            background: "linear-gradient(135deg, #efae83 0%, #f5c4a0 100%)",
          }}
          aria-hidden
        />
      )}
    </div>
  );
};

export default DeferredGradientBackground;
