import "@testing-library/jest-dom";
import puppeteer, { Browser, Page } from "puppeteer";

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
    },
  })),
}));

// Mock database functions
jest.mock("@/db/registration", () => ({
  getRegistration: jest.fn(),
}));

// E2E Test Setup
let browser: Browser | null = null;

export async function createPage(): Promise<Page> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: process.env.CI === "true" ? true : false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });
  }
  return await browser.newPage();
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

// Global teardown for E2E tests
afterAll(async () => {
  // Clean up browser
  await cleanupBrowser();
});
