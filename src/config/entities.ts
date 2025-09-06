export type Field =
  | {
      key: string;
      label: string;
      type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiline';
      required?: boolean;
      minLen?: number;
      maxLen?: number;
      pattern?: string;
      selectOptions?: { value: string; label: string }[];
    };

export type EntityConfig = {
  key: string; // storage key, route segment
  label: string; // display name
  fields: Field[]; // form/table fields
  idField: string; // primary id prop
};

export const ENTITIES: EntityConfig[] = [
  {
    key: 'requests',
    label: 'פניות',
    idField: 'idNumber',
    fields: [
      { key: 'idNumber', label: 'מספר זהות', type: 'text', required: true, pattern: '^\\d{9}$' },
      { key: 'name', label: 'שם', type: 'text', required: true, minLen: 2 },
      { key: 'email', label: 'מייל', type: 'email', required: true },
      { key: 'role', label: 'תפקיד', type: 'select', required: true, selectOptions: [
        { value: 'סטודנט', label: 'סטודנט' },
        { value: 'מנהל', label: 'מנהל' }
      ]},
      { key: 'status', label: 'סטטוס', type: 'select', required: true, selectOptions: [
        { value: 'פתוחה', label: 'פתוחה' },
        { value: 'בטיפול', label: 'בטיפול' },
        { value: 'נסגרה', label: 'נסגרה' }
      ]},
      { key: 'subject', label: 'נושא', type: 'select', required: true, selectOptions: [
        { value: 'קורסים', label: 'קורסים' },
        { value: 'מערכת שעות', label: 'מערכת שעות' },
        { value: 'בחינות ועבודות', label: 'בחינות ועבודות' },
        { value: 'אישורים ומסמכים', label: 'אישורים ומסמכים' },
        { value: 'שכר לימוד', label: 'שכר לימוד' },
        { value: 'אחר', label: 'אחר' }
      ]},
      { key: 'details', label: 'תיאור', type: 'multiline', required: true, minLen: 10 },
    ],
  },
];

export const getEntityByKey = (key: string): EntityConfig | undefined =>
  ENTITIES.find((e) => e.key === key);


