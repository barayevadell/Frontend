import type { EntityConfig, Field } from '../config/entities';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateField = (value: unknown, field: Field): string | null => {
  const v = value as string | number | null | undefined;
  const isEmpty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

  if (field.required && isEmpty) return 'שדה חובה';
  if (isEmpty) return null;

  const strVal = String(v);

  if (field.minLen !== undefined && strVal.length < field.minLen) {
    return `יש להזין לפחות ${field.minLen} תווים`;
  }
  if (field.maxLen !== undefined && strVal.length > field.maxLen) {
    return `יש להזין לכל היותר ${field.maxLen} תווים`;
  }

  if (field.pattern) {
    try {
      const re = new RegExp(field.pattern);
      if (!re.test(strVal)) return 'פורמט לא תקין';
    } catch {
      // ignore invalid patterns
    }
  }

  switch (field.type) {
    case 'email':
      if (!emailRegex.test(strVal)) return 'כתובת מייל לא תקינה';
      break;
    case 'number':
      if (Number.isNaN(Number(strVal))) return 'יש להזין מספר';
      break;
    case 'date':
      // Accept yyyy-mm-dd or ISO
      if (!/^\d{4}-\d{2}-\d{2}$/.test(strVal) && Number.isNaN(Date.parse(strVal))) {
        return 'תאריך לא תקין';
      }
      break;
  }

  return null;
};

export const validateRecord = (
  record: Record<string, unknown>,
  entity: EntityConfig
): Record<string, string | null> => {
  const errors: Record<string, string | null> = {};
  for (const field of entity.fields) {
    errors[field.key] = validateField(record[field.key], field);
  }
  return errors;
};

export const hasErrors = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).some((e) => e);
};


