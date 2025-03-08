"use client";
import React, { useEffect, useRef } from "react";
import styles from "./DynamicGradientBackground.module.css";

const DynamicGradientBackground = () => {
  const canvasRef = useRef(null);
  const noiseCanvasRef = useRef(null);

  useEffect(() => {
    // Main gradient canvas setup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Noise canvas setup
    const noiseCanvas = noiseCanvasRef.current;
    const noiseCtx = noiseCanvas.getContext("2d");
    noiseCanvas.width = width;
    noiseCanvas.height = height;

    // Determine if it's a mobile device based on screen width
    const isMobile = width < 768;

    // Use the same colors for both mobile and desktop
    const colors = [
      [255, 255, 255], // White
      [232, 44, 162], // Pink
      [110, 64, 242], // Purple
      [255, 222, 0], // Yellow
      [251, 84, 65], // Orange
    ];

    // Adjust parameters based on device, but keep the same visual approach
    // Reduce bubble count on desktop to prevent colors from being too condensed
    const bubbleCount = isMobile ? 12 : 15;

    // Lower alpha on desktop to prevent colors from looking too dark
    const baseAlpha = isMobile ? 0.08 : 0.06;
    const alphaVariation = isMobile ? 0.1 : 0.06;

    // Scale radius based on screen size but increase spacing
    const scaleFactor = isMobile ? 1 : 1.6; // Larger but fewer bubbles on desktop
    const baseRadius = isMobile ? 200 : 280 * scaleFactor;
    const radiusVariation = isMobile ? 250 : 300 * scaleFactor;

    // Create bubbles more strategically to cover the whole screen
    const bubbles = [];

    // Better distribution of bubbles across the screen
    // Add corner bubbles to ensure coverage, but more spread out on desktop
    const cornerOffset = isMobile ? 0.1 : 0.15;
    const corners = [
      { x: width * cornerOffset, y: height * cornerOffset },
      { x: width * (1 - cornerOffset), y: height * cornerOffset },
      { x: width * cornerOffset, y: height * (1 - cornerOffset) },
      { x: width * (1 - cornerOffset), y: height * (1 - cornerOffset) },
      { x: width * 0.5, y: height * 0.5 }, // Center
    ];

    // Add bubbles at strategic corners first
    for (const corner of corners) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      bubbles.push({
        x: corner.x,
        y: corner.y,
        radius: Math.random() * radiusVariation + baseRadius,
        color: colors[colorIndex],
        vx: (Math.random() - 0.5) * (isMobile ? 0.6 : 0.4), // Slower on desktop
        vy: (Math.random() - 0.5) * (isMobile ? 0.6 : 0.4), // Slower on desktop
        alpha: baseAlpha * 1.2 + Math.random() * alphaVariation,
      });
    }

    // Better grid distribution that accounts for screen aspect ratio
    const gridColumns = Math.ceil(Math.sqrt((bubbleCount * width) / height));
    const gridRows = Math.ceil(bubbleCount / gridColumns);
    const cellWidth = width / gridColumns;
    const cellHeight = height / gridRows;

    // Add grid bubbles with more spacing on desktop
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
        vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 0.5),
        alpha: baseAlpha + Math.random() * alphaVariation,
      });
    }

    // Add some extra random bubbles to fill any gaps (fewer on desktop)
    const fillerBubbles = isMobile ? 4 : 5;
    for (let i = 0; i < fillerBubbles; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (radiusVariation + 50) + baseRadius,
        color: colors[colorIndex],
        vx: (Math.random() - 0.5) * (isMobile ? 0.8 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.8 : 0.5),
        alpha: baseAlpha * 0.7 + Math.random() * (alphaVariation * 0.7),
      });
    }

    // Move bubbles for a few frames before showing to avoid initial clustering
    // More pre-movement frames for desktop to better distribute colors
    const preMovementFrames = isMobile ? 20 : 40;
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = 0; j < preMovementFrames; j++) {
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

    // Function to generate TV static noise
    function generateNoise() {
      const imageData = noiseCtx.createImageData(width, height);
      const data = imageData.data;

      // Much lower noise density and intensity for a more subtle effect
      const noiseDensity = isMobile ? 0.7 : 0.04; // Reduced density
      const noiseIntensity = isMobile ? 7 : 5; // Reduced intensity

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < noiseDensity) {
          const value = Math.floor(Math.random() * noiseIntensity);
          data[i] = data[i + 1] = data[i + 2] = value;
          data[i + 3] = 255; // Alpha channel
        } else {
          data[i] = data[i + 1] = data[i + 2] = 0;
          data[i + 3] = 0; // Transparent
        }
      }

      noiseCtx.putImageData(imageData, 0, 0);

      // Apply blend mode and lower opacity
      noiseCtx.globalCompositeOperation = "overlay";
      noiseCtx.globalAlpha = isMobile ? 0.04 : 0.03; // Reduced opacity
    }

    function drawBackground() {
      // Clear the canvas with a white background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillRect(0, 0, width, height);

      // Use multiply for both mobile and desktop but with lighter effect on desktop
      ctx.globalCompositeOperation = "multiply";

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

        // Use same gradient approach for both
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
        if (bubble.x < -bubble.radius) {
          bubble.x = width + bubble.radius;
        } else if (bubble.x > width + bubble.radius) {
          bubble.x = -bubble.radius;
        }

        if (bubble.y < -bubble.radius) {
          bubble.y = height + bubble.radius;
        } else if (bubble.y > height + bubble.radius) {
          bubble.y = -bubble.radius;
        }

        // Occasionally change direction slightly for more organic movement
        if (Math.random() < 0.005) {
          // Reduced frequency of direction changes
          bubble.vx += (Math.random() - 0.5) * 0.1; // Smaller direction changes
          bubble.vy += (Math.random() - 0.5) * 0.1;

          // Calculate current speed
          const speed = Math.sqrt(
            bubble.vx * bubble.vx + bubble.vy * bubble.vy,
          );

          // Ensure bubbles always have some minimum velocity
          const minSpeed = 0.2;
          if (speed < minSpeed) {
            bubble.vx = (bubble.vx / speed) * minSpeed;
            bubble.vy = (bubble.vy / speed) * minSpeed;
          }

          // Keep speed reasonable
          const maxSpeed = isMobile ? 1.0 : 0.9;
          if (speed > maxSpeed) {
            bubble.vx = (bubble.vx / speed) * maxSpeed;
            bubble.vy = (bubble.vy / speed) * maxSpeed;
          }
        }
      }

      // Reset blending mode
      ctx.globalCompositeOperation = "source-over";

      // Generate and draw noise
      noiseCtx.clearRect(0, 0, width, height);
      generateNoise();
    }

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      noiseCanvas.width = width;
      noiseCanvas.height = height;

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

    // Start the animation loop
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <canvas ref={noiseCanvasRef} className={styles.noiseCanvas} />
    </div>
  );
};

export default DynamicGradientBackground;
