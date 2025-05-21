/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl$/, // Change this to your required file extension
      use: "raw-loader",
    });

    return config;
  },

  experimental: {
    turbo: {
      rules: {
        "*.glsl": {
          loaders: ['raw-loader'],
          as: '*.js',
        }
      }
    }
  }
};

export default nextConfig;
