import { useState, useEffect } from "react";

/**
 * Custom hook to detect user's preference for reduced motion
 * @returns boolean indicating if user prefers reduced motion
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
    };
  }, []);

  return prefersReduced;
};
