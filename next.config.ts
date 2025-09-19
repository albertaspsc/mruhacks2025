import { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /**
   * Configure Next.js Image component for optimal performance
   */
  images: {
    // Use modern image formats for better compression and quality
    formats: ["image/webp", "image/avif"],

    // Device sizes for responsive images (viewport widths)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for specific use cases (icons, thumbnails, etc.)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Minimum cache time for optimized images (60 seconds)
    minimumCacheTTL: 60,

    // Allow SVG images (needed for icons and graphics)
    dangerouslyAllowSVG: true,

    // Content Security Policy for SVG handling
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * SWC compiler configuration for build-time optimizations
   */
  compiler: {
    // Remove console.log statements in production builds
    // Helps reduce bundle size and improve performance
    removeConsole: process.env.NODE_ENV === "production",
  },

  /**
   * Enable React Strict Mode for better development experience
   * Helps identify potential problems in the application
   */
  reactStrictMode: true,
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
