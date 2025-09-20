import { createPage, cleanupPage } from "../setup";
import {
  getTestUserCredentials,
  checkTestUsersExist,
  seedTestUsers,
  cleanupTestUsers,
} from "../helpers/seedTestUsers";

describe("Login User Workflows E2E Tests", () => {
  let page: any;

  beforeAll(async () => {
    // Check if test users exist, and seed them if they don't
    const usersExist = await checkTestUsersExist();
    if (!usersExist) {
      console.log("🌱 Test users not found, seeding them now...");
      await seedTestUsers();
      console.log("✅ Test users seeded successfully");
    } else {
      console.log("✅ Test users already exist");
    }
  });

  afterAll(async () => {
    // Clean up test users after all tests are complete
    try {
      await cleanupTestUsers();
      console.log("✅ Test users cleaned up successfully");
    } catch (error) {
      console.error("❌ Failed to cleanup test users:", error);
    }
  });

  beforeEach(async () => {
    page = await createPage();

    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 720 });

    // Clear any existing sessions
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  afterEach(async () => {
    if (page) {
      // Clear sessions after each test
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await cleanupPage(page);
    }
  });

  describe("Complete User Login Workflows", () => {
    test("should complete full participant login workflow", async () => {
      const { email, password } = getTestUserCredentials("participant");

      try {
        // Navigate to login page
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });

        // Fill and submit login form
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Wait for form to be ready and submit
        await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        await page.click('button[type="submit"]');

        // Wait for navigation and verify redirect
        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/user\/dashboard/);

        // Verify user can access protected routes
        await page.goto("http://localhost:3000/user/profile");
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/\/user\/profile/);

        // Verify session persists across page refresh
        await page.reload();
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/\/user\/profile/);
      } catch (error) {
        console.error("Participant login test failed:", error);
        throw error;
      }
    });

    test("should complete full admin login workflow", async () => {
      const { email, password } = getTestUserCredentials("admin");

      try {
        // Navigate to admin login portal
        await page.goto("http://localhost:3000/admin-login-portal");
        await page.waitForSelector(
          "form, input[type='email'], input[type='password']",
          { timeout: 15000 },
        );

        // Fill and submit admin login form
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Wait for submit button and click
        await page.waitForSelector(
          'button[type="submit"], button:not([type])',
          { timeout: 5000 },
        );
        await page.click('button[type="submit"], button:not([type])');

        // Wait for navigation and verify redirect
        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/admin\/dashboard/);

        // Verify admin can access admin routes
        await page.goto("http://localhost:3000/admin/workshops");
        await page.waitForTimeout(2000);
        expect(page.url()).toMatch(/\/admin\//);
      } catch (error) {
        console.error("Admin login test failed:", error);
        throw error;
      }
    });

    test("should complete full volunteer login workflow", async () => {
      const { email, password } = getTestUserCredentials("volunteer");

      try {
        // Navigate to admin login portal
        await page.goto("http://localhost:3000/admin-login-portal");
        await page.waitForSelector(
          "form, input[type='email'], input[type='password']",
          { timeout: 15000 },
        );

        // Fill and submit volunteer login form
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);

        // Wait for submit button and click
        await page.waitForSelector(
          'button[type="submit"], button:not([type])',
          { timeout: 5000 },
        );
        await page.click('button[type="submit"], button:not([type])');

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
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ timeout: 15000 });

        // Open new tab and verify session
        newPage = await page.browser().newPage();
        await newPage.goto("http://localhost:3000/user/dashboard");
        await newPage.waitForTimeout(3000);
        expect(newPage.url()).toMatch(/\/user\/dashboard/);

        // Logout in first tab
        await page.goto("http://localhost:3000/auth/logout");
        await page.waitForNavigation({ timeout: 15000 });

        // Verify second tab is also logged out
        await newPage.reload();
        await newPage.waitForTimeout(3000);
        expect(newPage.url()).toMatch(/\/login/);
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
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });

        // First attempt with wrong password
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', "WrongPassword123!");
        await page.click('button[type="submit"]');

        // Wait for error message or stay on login page
        await page.waitForTimeout(3000);
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
        await page.goto("http://localhost:3000/user/dashboard");
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/\/login/);
      } catch (error) {
        console.error("Unauthenticated redirect test failed:", error);
        throw error;
      }
    });

    test("should redirect unauthenticated user from admin route to admin login", async () => {
      try {
        await page.goto("http://localhost:3000/admin/dashboard");
        await page.waitForTimeout(3000);
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
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ timeout: 15000 });

        // Try to access login page again
        await page.goto("http://localhost:3000/login");
        await page.waitForTimeout(3000);
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
        await page.goto("http://localhost:3000/login");
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

    test("should work with different screen sizes", async () => {
      const { email, password } = getTestUserCredentials("participant");

      try {
        // Test mobile viewport
        await page.setViewport({ width: 375, height: 667 });
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });

        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/user\/dashboard/);

        // Test desktop viewport
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto("http://localhost:3000/login");
        await page.waitForSelector("form", { timeout: 15000 });

        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ timeout: 15000 });
        expect(page.url()).toMatch(/\/user\/dashboard/);
      } catch (error) {
        console.error("Screen size test failed:", error);
        throw error;
      }
    });
  });
});
