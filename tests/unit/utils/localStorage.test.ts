/**
 * Tests for localStorage utilities
 */

import {
  setWithExpiry,
  getWithExpiry,
  removeWithExpiry,
  hasValidItem,
} from "@/utils/localStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("localStorage utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("setWithExpiry", () => {
    it("should store data with timestamp and expiration", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 1000);

      const stored = localStorageMock.getItem("test-key");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(testData);
      expect(typeof parsed.timestamp).toBe("number");
      expect(parsed.expiresIn).toBe(1000);
    });

    it("should use default 7-day expiration when not specified", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData);

      const stored = localStorageMock.getItem("test-key");
      const parsed = JSON.parse(stored!);
      expect(parsed.expiresIn).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe("getWithExpiry", () => {
    it("should return data if not expired", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 10000);

      const result = getWithExpiry("test-key");
      expect(result).toEqual(testData);
    });

    it("should return null if expired", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 1); // 1ms expiration

      // Wait for expiration
      setTimeout(() => {
        const result = getWithExpiry("test-key");
        expect(result).toBeNull();
      }, 10);
    });

    it("should return null if key does not exist", () => {
      const result = getWithExpiry("non-existent-key");
      expect(result).toBeNull();
    });

    it("should remove expired items from localStorage", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 1); // 1ms expiration

      setTimeout(() => {
        getWithExpiry("test-key");
        const stored = localStorageMock.getItem("test-key");
        expect(stored).toBeNull();
      }, 10);
    });
  });

  describe("removeWithExpiry", () => {
    it("should remove item from localStorage", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData);

      expect(localStorageMock.getItem("test-key")).toBeTruthy();

      removeWithExpiry("test-key");

      expect(localStorageMock.getItem("test-key")).toBeNull();
    });
  });

  describe("hasValidItem", () => {
    it("should return true for valid, non-expired items", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 10000);

      expect(hasValidItem("test-key")).toBe(true);
    });

    it("should return false for expired items", () => {
      const testData = { test: "value" };
      setWithExpiry("test-key", testData, 1); // 1ms expiration

      setTimeout(() => {
        expect(hasValidItem("test-key")).toBe(false);
      }, 10);
    });

    it("should return false for non-existent items", () => {
      expect(hasValidItem("non-existent-key")).toBe(false);
    });
  });
});
