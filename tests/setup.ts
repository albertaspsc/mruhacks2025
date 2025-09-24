import "@testing-library/jest-dom";
import puppeteer, { Browser, Page } from "puppeteer";
import {
  startTestServer,
  stopTestServer,
  getTestServer,
} from "./helpers/testServer.cjs";

// Mock Next.js navigation (consolidated)
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/"),
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  headers: () => ({
    get: jest.fn().mockReturnValue("http://localhost:3000"),
  }),
}));

// Mock Next.js cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

// E2E Test Setup
let browser: Browser | null = null;

export async function createPage(): Promise<Page> {
  // Always create a new browser instance for each test to avoid connection issues
  if (browser) {
    await browser.close();
  }

  browser = await puppeteer.launch({
    headless: process.env.CI === "true" ? true : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
    timeout: 30000,
  });

  const page = await browser.newPage();

  // Set permissions for localStorage access
  await page.evaluateOnNewDocument(() => {
    // Store the original localStorage before overriding
    const originalLocalStorage = window.localStorage;

    // Grant permissions for localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => originalLocalStorage.getItem(key),
        setItem: (key: string, value: string) =>
          originalLocalStorage.setItem(key, value),
        removeItem: (key: string) => originalLocalStorage.removeItem(key),
        clear: () => originalLocalStorage.clear(),
        get length() {
          return originalLocalStorage.length;
        },
        key: (index: number) => originalLocalStorage.key(index),
      },
      writable: true,
    });
  });

  // Set default timeout
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

  return page;
}

export async function cleanupPage(page: Page): Promise<void> {
  if (page && !page.isClosed()) {
    await page.close();
  }
}

export async function cleanupBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export { getTestServer } from "./helpers/testServer.cjs";

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Global test teardown
afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Global setup for E2E tests
beforeAll(async () => {
  // Start test server before running e2e tests
  if (process.env.NODE_ENV !== "test" || process.env.TEST_TYPE === "e2e") {
    try {
      await startTestServer();
      console.log("✅ Test server started successfully");
    } catch (error) {
      console.error("❌ Failed to start test server:", error);
      throw error;
    }
  }
});

// Global teardown for E2E tests
afterAll(async () => {
  // Clean up browser
  await cleanupBrowser();

  // Stop test server after all tests
  try {
    await stopTestServer();
    console.log("✅ Test server stopped successfully");
  } catch (error) {
    console.error("❌ Failed to stop test server:", error);
  }
});
