"use client";
import React, { useEffect, useRef } from "react";
import styles from "./DynamicGradientBackground.module.css";

const DynamicGradientBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette
    const colors = [
      [255, 255, 255], // #FFFFFF (White)
      [232, 44, 162], // #E82CA2 (Pink)
      [255, 222, 0], // #FFDE00 (Yellow)
      [251, 84, 65], // #FB5441 (Coral/Red)
      [110, 64, 242], // #6E40F2 (Purple)
    ];

    // Determine if it's a mobile device based on screen width
    const isMobile = width < 768;

    // Adjust parameters based on device
    const bubbleCount = isMobile ? 12 : 25; // Fewer bubbles on mobile
    const baseAlpha = isMobile ? 0.08 : 0.15; // Lower alpha on mobile
    const alphaVariation = isMobile ? 0.1 : 0.2; // Less variation on mobile
    const baseRadius = isMobile ? 200 : 250; // Smaller base radius on mobile
    const radiusVariation = isMobile ? 250 : 350; // Less radius variation on mobile

    // Create bubbles
    const bubbles = [];

    // Better grid distribution that accounts for screen aspect ratio
    const gridColumns = Math.ceil(Math.sqrt((bubbleCount * width) / height));
    const gridRows = Math.ceil(bubbleCount / gridColumns);
    const cellWidth = width / gridColumns;
    const cellHeight = height / gridRows;

    for (let i = 0; i < bubbleCount; i++) {
      // Calculate grid position
      const gridX = i % gridColumns;
      const gridY = Math.floor(i / gridColumns);

      const colorIndex = Math.floor(Math.random() * colors.length);
      bubbles.push({
        x:
          gridX * cellWidth + Math.random() * cellWidth * 0.8 + cellWidth * 0.1,
        y:
          gridY * cellHeight +
          Math.random() * cellHeight * 0.8 +
          cellHeight * 0.1,
        radius: Math.random() * radiusVariation + baseRadius,
        color: colors[colorIndex],
        vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2),
        vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2),
        alpha: baseAlpha + Math.random() * alphaVariation,
      });
    }

    // Add some extra random bubbles to fill any gaps (fewer on mobile)
    const fillerBubbles = isMobile ? 4 : 10;
    for (let i = 0; i < fillerBubbles; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (radiusVariation + 50) + baseRadius,
        color: colors[colorIndex],
        vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2),
        vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 1.2),
        alpha: baseAlpha * 0.7 + Math.random() * (alphaVariation * 0.7),
      });
    }

    // Move bubbles for a few frames before showing to avoid initial clustering
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = 0; j < 20; j++) {
        bubbles[i].x += bubbles[i].vx;
        bubbles[i].y += bubbles[i].vy;

        // Bounce off edges
        if (bubbles[i].x < -bubbles[i].radius)
          bubbles[i].x = width + bubbles[i].radius;
        if (bubbles[i].x > width + bubbles[i].radius)
          bubbles[i].x = -bubbles[i].radius;
        if (bubbles[i].y < -bubbles[i].radius)
          bubbles[i].y = height + bubbles[i].radius;
        if (bubbles[i].y > height + bubbles[i].radius)
          bubbles[i].y = -bubbles[i].radius;
      }
    }

    function drawBackground() {
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillRect(0, 0, width, height);

      // Set blending mode - use different mode for mobile
      ctx.globalCompositeOperation = isMobile ? "multiply" : "lighten";

      // Draw each bubble
      for (const bubble of bubbles) {
        // Create a radial gradient for each bubble
        const gradient = ctx.createRadialGradient(
          bubble.x,
          bubble.y,
          0,
          bubble.x,
          bubble.y,
          bubble.radius,
        );

        gradient.addColorStop(
          0,
          `rgba(${bubble.color[0]}, ${bubble.color[1]}, ${bubble.color[2]}, ${bubble.alpha})`,
        );
        gradient.addColorStop(
          0.7,
          `rgba(${bubble.color[0]}, ${bubble.color[1]}, ${bubble.color[2]}, ${bubble.alpha * 0.6})`,
        );
        gradient.addColorStop(
          1,
          `rgba(${bubble.color[0]}, ${bubble.color[1]}, ${bubble.color[2]}, 0)`,
        );

        ctx.fillStyle = gradient;

        // Draw a circle with the gradient
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Move the bubble
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // Bounce off edges with some buffer to prevent visible cutoffs
        if (bubble.x < -bubble.radius) bubble.x = width + bubble.radius;
        if (bubble.x > width + bubble.radius) bubble.x = -bubble.radius;
        if (bubble.y < -bubble.radius) bubble.y = height + bubble.radius;
        if (bubble.y > height + bubble.radius) bubble.y = -bubble.radius;

        // Occasionally change direction slightly for more organic movement
        if (Math.random() < 0.01) {
          bubble.vx += (Math.random() - 0.5) * 0.2;
          bubble.vy += (Math.random() - 0.5) * 0.2;

          // Keep speed reasonable but different for mobile
          const maxSpeed = isMobile ? 1.2 : 1.8;
          const speed = Math.sqrt(
            bubble.vx * bubble.vx + bubble.vy * bubble.vy,
          );
          if (speed > maxSpeed) {
            bubble.vx = (bubble.vx / speed) * maxSpeed;
            bubble.vy = (bubble.vy / speed) * maxSpeed;
          }
        }
      }

      // Reset blending mode
      ctx.globalCompositeOperation = "source-over";
    }

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Update isMobile and recreate bubbles if the device type changes
      const newIsMobile = width < 768;
      if (newIsMobile !== isMobile) {
        window.location.reload(); // Solution to recreate bubbles with new settings
      }
    }

    window.addEventListener("resize", handleResize);

    // Animation loop
    function animate() {
      drawBackground();
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default DynamicGradientBackground;
