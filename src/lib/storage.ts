import { generateEmailFromName, migrateEmailsInData, isEmailValidForName } from './emailGenerator';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const STORAGE_PREFIX = 'blue-admin:';
const getKey = (entityKey: string) => `${STORAGE_PREFIX}${entityKey}`;

// ✅ Safe JSON parsing helper
const safeParse = <T>(text: string | null, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('[STORAGE PARSE ERROR]', error);
    return fallback;
  }
};

// ✅ Safe JSON stringify helper
const safeStringify = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('[STORAGE STRINGIFY ERROR]', error);
    return '[]';
  }
};

// 🚫 Disable old migration logic to stop recursion
const migrateOldData = (): void => {
  console.log('[MIGRATION DISABLED] Using Firestore instead of localStorage');
};

// ✅ Firestore-aware readAll
export const readAll = async (entityKey: string): Promise<any[]> => {
  try {
    console.log(`[READ] Firestore collection: ${entityKey}`);
    const snapshot = await getDocs(collection(db, entityKey));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error(`[READ ERROR] ${entityKey}:`, error);
    // fallback to localStorage if Firestore fails
    const raw = localStorage.getItem(getKey(entityKey));
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  }
};

// ✅ Firestore-aware writeAll
export const writeAll = async (entityKey: string, items: any[]): Promise<void> => {
  try {
    const colRef = collection(db, entityKey);
    for (const item of items) {
      await addDoc(colRef, item);
    }
    console.log(`[WRITE] ${items.length} ${entityKey} added to Firestore`);
  } catch (error) {
    console.error('[WRITE ERROR]', error);
    // fallback localStorage
    localStorage.setItem(getKey(entityKey), safeStringify(items));
  }
};

// ✅ Firestore-aware append (add one)
export const append = async (entityKey: string, item: any): Promise<void> => {
  try {
    await addDoc(collection(db, entityKey), item);
    console.log(`[APPEND] Added 1 ${entityKey} to Firestore`);
  } catch (error) {
    console.error('[APPEND ERROR]', error);
    const existing = readAllLocal(entityKey);
    existing.push(item);
    localStorage.setItem(getKey(entityKey), safeStringify(existing));
  }
};

// Helper for fallback only
const readAllLocal = (entityKey: string): any[] => {
  const raw = localStorage.getItem(getKey(entityKey));
  return safeParse(raw, []);
};

export const exists = (entityKey: string): boolean => {
  const raw = localStorage.getItem(getKey(entityKey));
  return raw !== null && raw !== '';
};

export const clearAll = (entityKey: string): void => {
  localStorage.removeItem(getKey(entityKey));
};

// ✅ User-specific Firestore methods
export const readAllUsers = async (): Promise<any[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('[READ USERS ERROR]', error);
    return safeParse(localStorage.getItem('blue-admin:users'), []);
  }
};

export const writeAllUsers = async (users: any[]): Promise<void> => {
  try {
    const colRef = collection(db, 'users');
    for (const user of users) {
      await addDoc(colRef, user);
    }
    console.log(`[WRITE] ${users.length} users added to Firestore`);
  } catch (error) {
    console.error('[WRITE USERS ERROR]', error);
    localStorage.setItem('blue-admin:users', safeStringify(users));
  }
};

export const appendUser = async (user: any): Promise<void> => {
  try {
    await addDoc(collection(db, 'users'), user);
    console.log('[APPEND USER] Added user to Firestore');
  } catch (error) {
    console.error('[APPEND USER ERROR]', error);
    const existing = readAllLocal('users');
    existing.push(user);
    localStorage.setItem('blue-admin:users', safeStringify(existing));
  }
};

// Local-only fallbacks (kept for compatibility)
export const updateUser = (idNumber: string, updatedUser: any): void => {
  const users = readAllLocal('users');
  const index = users.findIndex((u) => u.idNumber === idNumber);
  if (index >= 0) {
    users[index] = { ...users[index], ...updatedUser, updatedAt: new Date().toISOString() };
    localStorage.setItem('blue-admin:users', safeStringify(users));
  }
};

export const deleteUser = (idNumber: string): void => {
  const users = readAllLocal('users');
  const filtered = users.filter((u) => u.idNumber !== idNumber);
  localStorage.setItem('blue-admin:users', safeStringify(filtered));
};

export const userExists = (idNumber: string): boolean => {
  const users = readAllLocal('users');
  return users.some((u) => u.idNumber === idNumber);
};

export const hasUserRequests = (idNumber: string): boolean => {
  const requests = readAllLocal('requests');
  return requests.some((r) => r.idNumber === idNumber);
};

export { STORAGE_PREFIX };
