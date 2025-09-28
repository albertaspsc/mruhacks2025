/**
 * Local storage utilities with expiration support
 */

interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

/**
 * Save data to localStorage with expiration
 * @param key - The storage key
 * @param data - The data to store
 * @param expiresInMs - Expiration time in milliseconds (default: 7 days)
 */
export function setWithExpiry<T>(
  key: string,
  data: T,
  expiresInMs: number = 7 * 24 * 60 * 60 * 1000,
): void {
  try {
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}

/**
 * Get data from localStorage, checking for expiration
 * @param key - The storage key
 * @returns The data if valid and not expired, null otherwise
 */
export function getWithExpiry<T>(key: string): T | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item: StorageItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    // Check if the item has expired
    if (now - item.timestamp > item.expiresIn) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.warn("Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Remove an item from localStorage
 * @param key - The storage key
 */
export function removeWithExpiry(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove from localStorage:", error);
  }
}

/**
 * Check if an item exists and is not expired
 * @param key - The storage key
 * @returns true if item exists and is not expired
 */
export function hasValidItem(key: string): boolean {
  return getWithExpiry(key) !== null;
}
