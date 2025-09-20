import React from "react";
import styles from "./GradientBackground.module.css";
interface Props {}

/**
 * GradientBackground
 * Renders an animated CSS gradient background.
 */
export const GradientBackground: React.FC<Props> = () => {
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
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layered} aria-hidden>
      {renderGradient()}
    </div>
  );
};

export default GradientBackground;
