/** next.config.js **/
const nextConfig = {
  // … your existing config …
  webpack(cfg, { isServer }) {
    cfg.module.rules.push({
      test: /\.glsl$/,
      use: "raw-loader",
    });
    return cfg;
  },
};

module.exports = nextConfig;
