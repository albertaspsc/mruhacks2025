/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl$/, // Change this to your required file extension
      use: "raw-loader",
    });

    return config;
  },
};

export default nextConfig;
