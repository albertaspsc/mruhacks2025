import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}"],
  moduleNameMapper: {
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/db/(.*)$": "<rootDir>/src/db/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  globals: {
    Request: class Request {
      constructor(input, init) {
        this.url = input;
        this.method = init?.method || "GET";
        this.headers = new Map();
        this.cookies = new Map();
      }
    },
    Response: class Response {
      constructor(body, init) {
        this.body = body;
        this.status = init?.status || 200;
        this.headers = new Map();
      }
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
