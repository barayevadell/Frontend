// src/utils/storage.ts
export const ls = {
  // Get a value from localStorage and parse it
  get<T = unknown>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  // Save a value to localStorage
  set(key: string, val: unknown) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  // Remove a value
  remove(key: string) {
    localStorage.removeItem(key);
  },

  // Check if key exists
  has(key: string) {
    return localStorage.getItem(key) !== null;
  },
};
