import { generateEmailFromName, migrateEmailsInData, isEmailValidForName } from './emailGenerator';

const STORAGE_PREFIX = 'blue-admin:';

const getKey = (entityKey: string) => `${STORAGE_PREFIX}${entityKey}`;

// Safe JSON parsing helper
const safeParse = <T>(text: string | null, fallback: T): T => {
  if (!text) return fallback;
  
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('[STORAGE PARSE ERROR]', error, 'for text:', text?.substring(0, 100));
    return fallback;
  }
};

// Safe JSON stringify helper
const safeStringify = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('[STORAGE STRINGIFY ERROR]', error);
    return '[]';
  }
};

// Migration function to handle old storage keys
const migrateOldData = (): void => {
  const oldKeys = ['open-requests', 'blue-admin:open-requests', 'blue-admin:tickets'];
  const canonicalKey = 'blue-admin:requests';
  
  // Check if canonical key already has data
  const existingData = localStorage.getItem(canonicalKey);
  if (existingData) {
    const parsed = safeParse(existingData, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return; // Already migrated
    }
  }
  
  // Try to migrate from old keys
  for (const oldKey of oldKeys) {
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      const parsed = safeParse(oldData, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(canonicalKey, oldData);
        console.log('[MIGRATION] Migrated data from', oldKey, 'to', canonicalKey);
        break; // Only migrate from the first non-empty source
      }
    }
  }
  
  // Clean up old keys
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log('[MIGRATION] Removed old key', key);
    }
  });
};

// Backfill function to ensure data consistency
const backfillData = (data: any[]): any[] => {
  const subjects = ['קורסים', 'מערכת שעות', 'בחינות ועבודות', 'אישורים ומסמכים', 'שכר לימוד', 'אחר'];
  const subjectPlaceholders = {
    'קורסים': 'בקשה לבירור בנושא קורסים',
    'מערכת שעות': 'בקשה לבירור בנושא מערכת שעות',
    'בחינות ועבודות': 'בקשת מידע על בחינה',
    'אישורים ומסמכים': 'בקשה לאישור או מסמך',
    'שכר לימוד': 'בקשה בנוגע לשכר לימוד',
    'אחר': 'בקשה כללית'
  };
  
  return data.map(item => {
    const updated = { ...item };
    
    // Backfill subject if missing
    if (!updated.subject) {
      updated.subject = subjects[Math.floor(Math.random() * subjects.length)];
    }
    
    // Backfill details if missing or empty
    if (!updated.details || updated.details.trim() === '') {
      updated.details = subjectPlaceholders[updated.subject as keyof typeof subjectPlaceholders] || 'בקשה כללית';
    }
    
    // Generate email from name if name exists
    if (updated.name && (!updated.email || !isEmailValidForName(updated.email, updated.name))) {
      updated.email = generateEmailFromName(updated.name);
    }
    
    // Ensure attachments array exists
    if (!updated.attachments) {
      updated.attachments = [];
    }
    
    // Ensure timestamps exist
    if (!updated.createdAt) {
      updated.createdAt = new Date().toISOString();
    }
    if (!updated.updatedAt) {
      updated.updatedAt = updated.createdAt;
    }
    
    return updated;
  });
};

// ID migration function
const migrateIds = (data: any[]): { updatedData: any[], fixedCount: number } => {
  let fixedCount = 0;
  const existingIds = new Set<string>();
  
  // First pass: collect all valid existing IDs
  data.forEach(item => {
    if (item.idNumber && /^\d{9}$/.test(item.idNumber)) {
      existingIds.add(item.idNumber);
    }
  });
  
  const updatedData = data.map(item => {
    // Check if idNumber is missing, empty, non-numeric, or not 9 digits
    if (!item.idNumber || !/^\d{9}$/.test(item.idNumber)) {
      fixedCount++;
      
      // Generate a new unique 9-digit ID
      let newId: string;
      do {
        newId = Math.floor(100000000 + Math.random() * 900000000).toString();
      } while (existingIds.has(newId));
      
      existingIds.add(newId);
      return { ...item, idNumber: newId };
    }
    return item;
  });
  
  return { updatedData, fixedCount };
};

// Email migration function - safe version
const migrateEmails = (): void => {
  try {
    const data = readAll('requests');
    const { updatedData, fixedCount } = migrateEmailsInData(data);
    
    if (fixedCount > 0) {
      writeAll('requests', updatedData);
      console.log(`[MIGRATION] email fixed ${fixedCount} records`);
    }
  } catch (error) {
    console.error('[MIGRATION] email migration failed:', error);
  }
};

export const readAll = (entityKey: string): any[] => {
  if ((import.meta as any).env?.DEV) {
    console.log('[READ]', `key=${entityKey}`);
  }
  
  // Run migration on first read
  if (entityKey === 'requests') {
    migrateOldData();
  }
  
  const raw = localStorage.getItem(getKey(entityKey));
  const parsed = safeParse(raw, []);
  const data = Array.isArray(parsed) ? parsed : [];
  
  // Backfill data for requests to ensure consistency
  if (entityKey === 'requests') {
    try {
      // First run ID migration
      const { updatedData: idFixedData, fixedCount: idFixedCount } = migrateIds(data);
      if (idFixedCount > 0) {
        writeAll(entityKey, idFixedData);
        console.log(`[MIGRATION] id fixed ${idFixedCount} items`);
      }
      
      // Then backfill other fields
      const backfilledData = backfillData(idFixedData);
      // Only write back if changes were made
      if (JSON.stringify(backfilledData) !== JSON.stringify(idFixedData)) {
        writeAll(entityKey, backfilledData);
        console.log('[MIGRATION] backfill updated data consistency');
      }
      
      // Run email migration
      migrateEmails();
      
      if ((import.meta as any).env?.DEV) {
        console.log('[READ]', 'blue-admin:requests', backfilledData.length);
      }
      return backfilledData;
    } catch (error) {
      console.error('[MIGRATION] requests migration failed:', error);
      return data; // Return original data if migration fails
    }
  }
  
  if ((import.meta as any).env?.DEV) {
    console.log('[READ]', `key=${entityKey}`, `count=${data.length}`);
  }
  return data;
};

export const writeAll = (entityKey: string, items: any[]): void => {
  try {
    // Ensure items is an array
    const safeItems = Array.isArray(items) ? items : [];
    const jsonString = safeStringify(safeItems);
    localStorage.setItem(getKey(entityKey), jsonString);
  } catch (error) {
    console.error('[STORAGE WRITE ERROR]', error);
  }
};

export const append = (entityKey: string, item: any): void => {
  const existing = readAll(entityKey);
  const safeExisting = Array.isArray(existing) ? existing : [];
  safeExisting.push(item);
  writeAll(entityKey, safeExisting);
};

export const exists = (entityKey: string): boolean => {
  const raw = localStorage.getItem(getKey(entityKey));
  return raw !== null && raw !== '';
};

export const clearAll = (entityKey: string): void => {
  localStorage.removeItem(getKey(entityKey));
};

// Users-specific functions
export const readAllUsers = (): any[] => {
  const raw = localStorage.getItem('blue-admin:users');
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const writeAllUsers = (users: any[]): void => {
  const safeUsers = Array.isArray(users) ? users : [];
  const jsonString = safeStringify(safeUsers);
  localStorage.setItem('blue-admin:users', jsonString);
};

export const appendUser = (user: any): void => {
  const existing = readAllUsers();
  const safeExisting = Array.isArray(existing) ? existing : [];
  safeExisting.push(user);
  writeAllUsers(safeExisting);
};

export const updateUser = (idNumber: string, updatedUser: any): void => {
  const users = readAllUsers();
  const safeUsers = Array.isArray(users) ? users : [];
  const index = safeUsers.findIndex(u => u.idNumber === idNumber);
  if (index >= 0) {
    safeUsers[index] = { ...safeUsers[index], ...updatedUser, updatedAt: new Date().toISOString() };
    writeAllUsers(safeUsers);
  }
};

export const deleteUser = (idNumber: string): void => {
  const users = readAllUsers();
  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = safeUsers.filter(u => u.idNumber !== idNumber);
  writeAllUsers(filtered);
};

export const userExists = (idNumber: string): boolean => {
  const users = readAllUsers();
  const safeUsers = Array.isArray(users) ? users : [];
  return safeUsers.some(u => u.idNumber === idNumber);
};

export const hasUserRequests = (idNumber: string): boolean => {
  const requests = readAll('requests');
  const safeRequests = Array.isArray(requests) ? requests : [];
  return safeRequests.some(r => r.idNumber === idNumber);
};

export { STORAGE_PREFIX };