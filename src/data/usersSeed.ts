import { generateEmailFromName } from '@lib/emailGenerator';

export interface User {
  idNumber: string;
  fullName: string;
  email: string;
  role: 'מנהל' | 'סטודנט';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getUsersSeed = (): User[] => {
  const names = [
    'ישראל כהן',
    'דוד לוי', 
    'נועה ישראלי',
    'רון מזרחי',
    'מיה בר',
    'שיר אלון'
  ];

  const roles: ('מנהל' | 'סטודנט')[] = ['מנהל', 'סטודנט', 'מנהל', 'סטודנט', 'סטודנט', 'סטודנט'];

  return names.map((name, index) => {
    const now = new Date().toISOString();
    const idNumber = String(Math.floor(100000000 + Math.random() * 900000000));
    
    return {
      idNumber,
      fullName: name,
      email: generateEmailFromName(name),
      role: roles[index],
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
  });
};
