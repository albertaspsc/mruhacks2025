// Force headless mode for e2e tests
process.env.CI = "true";
process.env.HEADLESS = "true";
process.env.NODE_ENV = "test";

// Disable any interactive prompts
process.env.DISABLE_OPENCOLLECTIVE = "true";
process.env.SUPPRESS_NO_CONFIG_WARNING = "true";

// Set Puppeteer to headless mode
process.env.PUPPETEER_HEADLESS = "true";

// Disable any UI-related features
process.env.DISABLE_UI = "true";
process.env.SKIP_UI_TESTS = "false"; // Keep e2e tests running but headlessly
