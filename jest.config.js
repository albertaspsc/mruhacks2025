import { config } from "dotenv";

// Load environment variables from .env file
config();

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/e2e/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 60000, // Increased timeout for e2e tests
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
  verbose: true,
  // Force Jest to exit after tests complete
  forceExit: true,
  // Detect open handles to help debug cleanup issues
  detectOpenHandles: true,
  // Clear mocks and timers between tests
  clearMocks: true,
  restoreMocks: true,
  // Environment variables for headless mode
  setupFiles: ["<rootDir>/tests/helpers/setupEnv.js"],
  moduleNameMapper: {
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/db/(.*)$": "<rootDir>/src/db/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Global setup and teardown - use .cjs files for compatibility
  globalSetup: "<rootDir>/tests/helpers/globalSetup.cjs",
  globalTeardown: "<rootDir>/tests/helpers/globalTeardown.cjs",
  // Transform TypeScript files
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
