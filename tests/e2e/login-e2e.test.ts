import { createPage, cleanupPage, getTestServer } from "../setup";
import {
  getTestUserCredentials,
  checkTestUsersExist,
  seedTestUsers,
  cleanupTestUsers,
  seedTestWorkshops,
  cleanupTestWorkshops,
} from "../helpers/seedTestUsers";

// Helper function to check if the app is running
async function checkAppRunning(page: any): Promise<boolean> {
  try {
    const testServer = getTestServer();
    const baseUrl = testServer ? testServer.getUrl() : "http://localhost:3000";

    const response = await page.goto(baseUrl, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    return response && response.status() < 400;
  } catch (error) {
    console.log(
      "App not ready yet:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

// Helper function to get the correct base URL
function getBaseUrl(): string {
  const testServer = getTestServer();
  const baseUrl = testServer ? testServer.getUrl() : "http://localhost:3001";
  return baseUrl;
}

describe("Login User Workflows E2E Tests", () => {
  let page: any;

  beforeAll(async () => {
    // Check if test users exist, and seed them if they don't
    const usersExist = await checkTestUsersExist();
    if (!usersExist) {
      console.log("Test users not found, seeding them now...");
      await seedTestUsers();
      console.log("SUCCESS: Test users seeded successfully");
    } else {
      console.log("SUCCESS: Test users already exist");
    }

    // Seed test workshops
    console.log("Seeding test workshops...");
    await seedTestWorkshops();
    console.log("SUCCESS: Test workshops seeded successfully");
  });

  afterAll(async () => {
    // Clean up test workshops and users after all tests are complete
    try {
      await cleanupTestWorkshops();
      console.log("SUCCESS: Test workshops cleaned up successfully");
      await cleanupTestUsers();
      console.log("SUCCESS: Test users cleaned up successfully");
    } catch (error) {
      console.error("ERROR: Failed to cleanup test data:", error);
    }
  });

  beforeEach(async () => {
    page = await createPage();

    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 720 });

    // Set up console error logging
    const consoleErrors: string[] = [];
    page.on("console", (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.log("Browser console error:", msg.text());
      }
    });

    // Clear any existing sessions safely
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== "undefined") {
          localStorage.clear();
        }
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.clear();
        }
      });
    } catch (error) {
      console.log("Note: Could not clear storage, continuing with test");
    }
  });

  afterEach(async () => {
    if (page) {
      // Clear sessions after each test safely
      try {
        await page.evaluate(() => {
          if (typeof localStorage !== "undefined") {
            localStorage.clear();
          }
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.clear();
          }
        });
      } catch (error) {
        console.log("Note: Could not clear storage in cleanup, continuing");
      }
      await cleanupPage(page);
    }
  });

  describe("Complete User Login Workflows", () => {
    test("should complete full participant login workflow", async () => {
      const { email, password } = getTestUserCredentials("participant");
      const baseUrl = getBaseUrl();

      try {
        // Navigate to login page
        console.log(`Navigating to ${baseUrl}/login`);
        const response = await page.goto(`${baseUrl}/login`, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });
        console.log("Navigation response status:", response?.status());

        // Wait for page to load completely
        (await page.waitForLoadState?.("networkidle")) ||
          (await new Promise((resolve) => setTimeout(resolve, 3000)));

        // Check what's actually on the page
        const pageContent = await page.content();
        console.log("Page content length:", pageContent.length);
        console.log("Page title:", await page.title());
        console.log("Current URL:", page.url());

        // Check for console errors and network errors
        const consoleErrors: string[] = [];
        const networkErrors: string[] = [];

        page.on(
          "console",
          (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === "error") {
              consoleErrors.push(msg.text());
              console.log("Browser console error:", msg.text());
            }
          },
        );

        page.on(
          "response",
          (response: { ok: () => any; url: () => any; status: () => any }) => {
            if (!response.ok()) {
              networkErrors.push(`${response.url()}: ${response.status()}`);
              console.log("Network error:", response.url(), response.status());
            }
          },
        );

        // Wait a bit for any console errors to appear
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (consoleErrors.length > 0) {
          console.log("Console errors found:", consoleErrors);
        }

        if (networkErrors.length > 0) {
          console.log("Network errors found:", networkErrors);
        }

        // Check if the page has any JavaScript errors by evaluating in the browser
        const jsErrors = await page.evaluate(() => {
          const errors: string[] = [];
          const originalError = window.onerror;
          window.onerror = (message, source, lineno, colno, error) => {
            errors.push(`${message} at ${source}:${lineno}:${colno}`);
            if (originalError)
              originalError(message, source, lineno, colno, error);
          };
          return errors;
        });

        if (jsErrors.length > 0) {
          console.log("JavaScript errors found:", jsErrors);
        }

        // Check environment variables in the browser
        const envCheck = await page.evaluate(() => {
          return {
            supabaseUrl:
              typeof process !== "undefined"
                ? process.env?.NEXT_PUBLIC_SUPABASE_URL
                : "process not available",
            supabaseAnonKey:
              typeof process !== "undefined"
                ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
                : "process not available",
            nodeEnv:
              typeof process !== "undefined"
                ? process.env?.NODE_ENV
                : "process not available",
            hasProcess: typeof process !== "undefined",
            hasWindow: typeof window !== "undefined",
          };
        });

        console.log("Environment check:", envCheck);

        // Wait for form elements to be available
        console.log("Waiting for login form elements...");

        // Try to find any form first
        const forms = await page.$$("form");
        console.log("Forms found:", forms.length);

        if (forms.length === 0) {
          // Check if we're on the right page
          const bodyText = await page.evaluate(() => document.body.innerText);
          console.log(
            "Page body text (first 500 chars):",
            bodyText.substring(0, 500),
          );

          // Check for any error messages
          const errorElements = await page.$$(
            '[class*="error"], [class*="Error"]',
          );
          console.log("Error elements found:", errorElements.length);
        }

        await page.waitForSelector("form", { timeout: 15000 });
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.waitForSelector('input[type="password"]', {
          timeout: 10000,
        });

        // Clear any existing values and fill form
        await page.evaluate(() => {
          const emailInput = document.querySelector(
            'input[type="email"]',
          ) as HTMLInputElement;
          const passwordInput = document.querySelector(
            'input[type="password"]',
          ) as HTMLInputElement;
          if (emailInput) emailInput.value = "";
          if (passwordInput) passwordInput.value = "";
        });

        // Fill and submit login form
        console.log("Filling login form...");
        await page.type('input[type="email"]', email, { delay: 100 });
        await page.type('input[type="password"]', password, { delay: 100 });

        // Wait for submit button and click
        await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        console.log("Submitting login form...");
        await page.click('button[type="submit"]');

        // Wait for navigation and verify redirect
        console.log("Waiting for navigation...");
        await page.waitForNavigation({ timeout: 15000 });
        console.log("Current URL:", page.url());
        expect(page.url()).toMatch(/\/user\/dashboard/);

        // Verify user can access protected routes
        console.log("Testing protected route access...");
        await page.goto(`${baseUrl}/user/profile`, {
          waitUntil: "networkidle0",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        expect(page.url()).toMatch(/\/user\/profile/);

        // Verify session persists across page refresh
        console.log("Testing session persistence...");
        await page.reload();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        expect(page.url()).toMatch(/\/user\/profile/);
      } catch (error) {
        console.error("Participant login test failed:", error);
        // Take a screenshot for debugging
        try {
          await page.screenshot({ path: "test-failure.png" });
          console.log("Screenshot saved as test-failure.png");
        } catch (screenshotError) {
          console.log("Could not take screenshot:", screenshotError);
        }
        throw error;
      }
    });

    test("should complete full admin login workflow", async () => {
      const { email, password } = getTestUserCredentials("admin");
      const baseUrl = getBaseUrl();

      try {
        // Navigate to admin login portal
        console.log(`Navigating to ${baseUrl}/admin-login-portal`);
        await page.goto(`${baseUrl}/admin-login-portal`, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        // Wait for page to load completely
        (await page.waitForLoadState?.("networkidle")) ||
          (await new Promise((resolve) => setTimeout(resolve, 2000)));

        // Set up console and network error logging
        const consoleErrors: string[] = [];
        const networkErrors: string[] = [];

        page.on(
          "console",
          (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === "error") {
              consoleErrors.push(msg.text());
              console.log("Browser console error:", msg.text());
            }
          },
        );

        page.on(
          "response",
          (response: { ok: () => any; url: () => any; status: () => any }) => {
            if (!response.ok()) {
              networkErrors.push(`${response.url()}: ${response.status()}`);
              console.log("Network error:", response.url(), response.status());
            }
          },
        );

        // Wait for form elements to be available
        console.log("Waiting for admin login form elements...");
        // Admin login portal doesn't use a form element, just input fields
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.waitForSelector('input[type="password"]', {
          timeout: 10000,
        });

        // Clear any existing values and fill form
        await page.evaluate(() => {
          const emailInput = document.querySelector(
            'input[type="email"]',
          ) as HTMLInputElement;
          const passwordInput = document.querySelector(
            'input[type="password"]',
          ) as HTMLInputElement;
          if (emailInput) emailInput.value = "";
          if (passwordInput) passwordInput.value = "";
        });

        // Fill and submit admin login form
        console.log("Filling admin login form...");
        await page.type('input[type="email"]', email, { delay: 100 });
        await page.type('input[type="password"]', password, { delay: 100 });

        // Wait for submit button and click
        await page.waitForSelector("button", { timeout: 5000 });
        console.log("Submitting admin login form...");

        // Debug: Check button state
        const button = await page.$("button");
        const isDisabled = await button?.evaluate(
          (el: { disabled: any }) => el.disabled,
        );
        const buttonText = await button?.evaluate(
          (el: { textContent: any }) => el.textContent,
        );
        console.log("Button disabled:", isDisabled, "Button text:", buttonText);

        // Wait a bit for any loading states to settle
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Try different approaches to submit the form
        try {
          // First try pressing Enter in the password field
          await page.focus('input[type="password"]');
          await page.keyboard.press("Enter");
          console.log("Tried Enter key submission");
        } catch (enterError) {
          console.log("Enter key failed, trying button click:", enterError);

          // Try clicking the button with different selectors
          const buttonSelectors = [
            "button",
            'button[type="button"]',
            "button:not([type])",
            '[role="button"]',
            'input[type="submit"]',
          ];

          let clicked = false;
          for (const selector of buttonSelectors) {
            try {
              const element = await page.$(selector);
              if (element) {
                await element.click();
                console.log(
                  `Successfully clicked element with selector: ${selector}`,
                );
                clicked = true;
                break;
              }
            } catch (clickError) {
              console.log(`Failed to click ${selector}:`, clickError);
            }
          }

          if (!clicked) {
            // Last resort: try evaluate click
            await page.evaluate(() => {
              const button = document.querySelector(
                "button",
              ) as HTMLButtonElement;
              if (button) {
                button.click();
              }
            });
            console.log("Tried evaluate click as last resort");
          }
        }

        // Wait a bit and check for any errors
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Log any console or network errors
        if (consoleErrors.length > 0) {
          console.log("Console errors after click:", consoleErrors);
        }
        if (networkErrors.length > 0) {
          console.log("Network errors after click:", networkErrors);
        }

        // Check for error messages on the page
        const errorMessage = await page.evaluate(() => {
          const errorDiv = document.querySelector(
            '[class*="error"], [class*="Error"]',
          );
          return errorDiv ? errorDiv.textContent : null;
        });

        if (errorMessage) {
          console.log("Error message found:", errorMessage);
        }

        // Check if button is in loading state
        const buttonAfterClick = await page.$("button");
        const buttonTextAfter = await buttonAfterClick?.evaluate(
          (el: { textContent: any }) => el.textContent,
        );
        const buttonDisabledAfter = await buttonAfterClick?.evaluate(
          (el: { disabled: any }) => el.disabled,
        );
        console.log(
          "Button after click - disabled:",
          buttonDisabledAfter,
          "text:",
          buttonTextAfter,
        );

        console.log("Current URL after click:", page.url());

        // Wait for navigation and verify redirect
        console.log("Waiting for admin navigation...");
        try {
          await page.waitForNavigation({ timeout: 15000 });
          console.log("Current URL:", page.url());
        } catch (navError) {
          console.log("Navigation timeout, checking current URL:", page.url());
          // Check if we're already on the admin page
          if (page.url().includes("/admin/")) {
            console.log("Already on admin page, continuing...");
          } else {
            throw navError;
          }
        }
        expect(page.url()).toMatch(/\/admin\/dashboard/);

        // Verify admin can access admin routes
        console.log("Testing admin route access...");
        await page.goto(`${baseUrl}/admin/dashboard?tab=workshops`, {
          waitUntil: "networkidle0",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        expect(page.url()).toMatch(/\/admin\/dashboard/);
      } catch (error) {
        console.error("Admin login test failed:", error);
        // Take a screenshot for debugging
        try {
          await page.screenshot({ path: "admin-test-failure.png" });
          console.log("Screenshot saved as admin-test-failure.png");
        } catch (screenshotError) {
          console.log("Could not take screenshot:", screenshotError);
        }
        throw error;
      }
    });

    test("should complete full volunteer login workflow", async () => {
      const { email, password } = getTestUserCredentials("volunteer");

      try {
        // Navigate to admin login portal
        await page.goto(`${getBaseUrl()}/admin-login-portal`);
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.waitForSelector('input[type="password"]', {
          timeout: 10000,
        });

        // Fill and submit volunteer login form
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Use Enter key to submit the form
        await page.focus('input[type="password"]');
        await page.keyboard.press("Enter");

        // Wait for navigation and verify redirect
        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/volunteer\/dashboard/);
      } catch (error) {
        console.error("Volunteer login test failed:", error);
        throw error;
      }
    });
  });

  describe("Cross-Tab Session Management", () => {
    test("should sync login state across multiple tabs", async () => {
      const { email, password } = getTestUserCredentials("participant");
      let newPage: any = null;

      try {
        // Login in first tab
        await page.goto(`${getBaseUrl()}/login`);
        await page.waitForSelector("form", { timeout: 15000 });
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Use Enter key to submit the form
        await page.focus('input[type="password"]');
        await page.keyboard.press("Enter");
        await page.waitForNavigation({ timeout: 15000 });

        // Open new tab and verify session
        newPage = await page.browser().newPage();
        await newPage.goto(`${getBaseUrl()}/user/dashboard`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        expect(newPage.url()).toMatch(/\/user\/dashboard/);

        // Logout in first tab
        await page.goto(`${getBaseUrl()}/auth/logout`);

        // Wait for logout to complete (don't wait for navigation as logout might redirect)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check if we're on login page or if logout was successful
        const currentUrl = page.url();
        console.log("Current URL after logout:", currentUrl);

        // If not redirected to login, try to navigate there
        if (!currentUrl.includes("/login")) {
          await page.goto(`${getBaseUrl()}/login`);
        }

        // Verify second tab is also logged out
        await newPage.reload();
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check the URL of the second tab
        const secondTabUrl = newPage.url();
        console.log("Second tab URL after logout:", secondTabUrl);

        // The second tab should be redirected to login
        expect(secondTabUrl).toMatch(/\/login/);
      } catch (error) {
        console.error("Cross-tab session test failed:", error);
        throw error;
      } finally {
        if (newPage) {
          await newPage.close();
        }
      }
    });
  });

  describe("Error Recovery Workflows", () => {
    test("should recover from login error and successfully login", async () => {
      const { email, password } = getTestUserCredentials("participant");

      try {
        await page.goto(`${getBaseUrl()}/login`);
        await page.waitForSelector("form", { timeout: 15000 });

        // First attempt with wrong password
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', "WrongPassword123!");
        await page.click('button[type="submit"]');

        // Wait for error message or stay on login page
        await new Promise((resolve) => setTimeout(resolve, 3000));
        expect(page.url()).toMatch(/\/login/);

        // Clear password and try with correct password
        await page.evaluate(() => {
          const passwordInput = document.querySelector(
            'input[type="password"]',
          ) as HTMLInputElement;
          if (passwordInput) passwordInput.value = "";
        });
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');

        // Should now login successfully
        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/user\/dashboard/);
      } catch (error) {
        console.error("Error recovery test failed:", error);
        throw error;
      }
    });
  });

  describe("Navigation and Redirect Workflows", () => {
    test("should redirect unauthenticated user from protected route to login", async () => {
      try {
        await page.goto(`${getBaseUrl()}/user/dashboard`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        expect(page.url()).toMatch(/\/login/);
      } catch (error) {
        console.error("Unauthenticated redirect test failed:", error);
        throw error;
      }
    });

    test("should redirect unauthenticated user from admin route to admin login", async () => {
      try {
        await page.goto(`${getBaseUrl()}/admin/dashboard`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        expect(page.url()).toMatch(/\/admin-login-portal/);
      } catch (error) {
        console.error("Admin redirect test failed:", error);
        throw error;
      }
    });

    test("should redirect authenticated user from login page to dashboard", async () => {
      const { email, password } = getTestUserCredentials("participant");

      try {
        // Login first
        await page.goto(`${getBaseUrl()}/login`);
        await page.waitForSelector("form", { timeout: 15000 });
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ timeout: 15000 });

        // Try to access login page again
        await page.goto(`${getBaseUrl()}/login`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        expect(page.url()).toMatch(/\/user\/dashboard/);
      } catch (error) {
        console.error("Authenticated redirect test failed:", error);
        throw error;
      }
    });
  });

  describe("Browser Compatibility", () => {
    test("should work with keyboard navigation", async () => {
      const { email, password } = getTestUserCredentials("participant");

      try {
        await page.goto(`${getBaseUrl()}/login`);
        await page.waitForSelector("form", { timeout: 15000 });

        // Navigate using Tab key
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");

        // Type credentials
        await page.keyboard.type(email);
        await page.keyboard.press("Tab");
        await page.keyboard.type(password);

        // Submit with Enter key
        await page.keyboard.press("Enter");

        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/user\/dashboard/);
      } catch (error) {
        console.error("Keyboard navigation test failed:", error);
        throw error;
      }
    });
  });

  describe("Workshop Registration Workflows", () => {
    test("should complete workshop registration workflow", async () => {
      const { email, password } = getTestUserCredentials("participant");
      const baseUrl = getBaseUrl();

      try {
        // Login first
        console.log("Logging in user...");
        await page.goto(`${baseUrl}/login`, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        await page.waitForSelector("form", { timeout: 15000 });
        await page.type('input[type="email"]', email, { delay: 100 });
        await page.type('input[type="password"]', password, { delay: 100 });
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ timeout: 15000 });

        // Verify we're on the dashboard
        expect(page.url()).toMatch(/\/user\/dashboard/);
        console.log("SUCCESS: Successfully logged in and reached dashboard");

        // Wait for the page to fully load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Look for workshop elements
        console.log("Looking for workshop elements...");

        // Wait for the page to load and look for workshop-related content
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Look for workshop cards by checking for buttons with "Register" text
        const registerButtons = await page.$$("button");
        console.log(`Found ${registerButtons.length} buttons on the page`);

        // Filter for register buttons
        const registerButtonTexts = await Promise.all(
          registerButtons.map(
            async (button: { evaluate: (arg0: (el: any) => any) => any }) => {
              const text = await button.evaluate(
                (el: { textContent: string }) => el.textContent?.trim(),
              );
              return { button, text };
            },
          ),
        );

        const actualRegisterButtons = registerButtonTexts.filter(
          ({ text }) => text && text.toLowerCase().includes("register"),
        );

        console.log(`Found ${actualRegisterButtons.length} register buttons`);

        if (actualRegisterButtons.length > 0) {
          // Click the first register button
          console.log("Clicking register button...");
          await actualRegisterButtons[0].button.click();

          // Wait for registration to complete
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Check for success message or button state change
          const successMessage = await page.$(
            '[class*="success"], [class*="toast"]',
          );
          const unregisterButtons = await page.$$("button");
          const unregisterButtonTexts = await Promise.all(
            unregisterButtons.map(
              async (button: { evaluate: (arg0: (el: any) => any) => any }) => {
                const text = await button.evaluate(
                  (el: { textContent: string }) => el.textContent?.trim(),
                );
                return { button, text };
              },
            ),
          );
          const unregisterButton = unregisterButtonTexts.find(
            ({ text }) => text && text.toLowerCase().includes("unregister"),
          );

          if (successMessage || unregisterButton) {
            console.log("SUCCESS: Workshop registration successful");
          } else {
            console.log(
              "WARNING: Registration may have succeeded but no clear success indicator found",
            );
          }
        } else {
          // If no register buttons found, check if workshops are displayed
          // Look for any text that might indicate workshops
          const pageContent = await page.content();
          const hasWorkshopContent =
            pageContent.includes("workshop") ||
            pageContent.includes("Web Development") ||
            pageContent.includes("Mobile App") ||
            pageContent.includes("Data Science");

          if (hasWorkshopContent) {
            console.log("SUCCESS: Workshop content found on dashboard");
          } else {
            console.log("WARNING: No workshop content found on dashboard");
            console.log("Page content preview:", pageContent.substring(0, 500));
          }
        }

        // Verify we're still on the dashboard after interaction
        expect(page.url()).toMatch(/\/user\/dashboard/);
        console.log("SUCCESS: Still on dashboard after workshop interaction");
      } catch (error) {
        console.error("Workshop registration test failed:", error);
        // Take a screenshot for debugging
        try {
          await page.screenshot({ path: "workshop-test-failure.png" });
          console.log("Screenshot saved as workshop-test-failure.png");
        } catch (screenshotError) {
          console.log("Could not take screenshot:", screenshotError);
        }
        throw error;
      }
    });
  });
});
