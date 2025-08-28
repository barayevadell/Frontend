// src/utils/validators.ts

// Check if string is a valid email
export const isEmail = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Check if string is exactly 9 digits (ID number)
export const is9Digits = (s: string) =>
  /^\d{9}$/.test(s);

// Check if string is not empty
export const nonEmpty = (s: string) =>
  s.trim().length > 0;

// Check if file size is smaller than limit (default 10MB)
export const maxFileBytes = (file?: File, limit = 10 * 1024 * 1024) =>
  !file || file.size <= limit;
