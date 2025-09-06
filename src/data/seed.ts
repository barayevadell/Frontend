import type { EntityConfig } from '@config/entities';
import { generateEmailFromName } from '@lib/emailGenerator';

export const getSeed = (entity: EntityConfig): any[] => {
  if (entity.key === 'requests') {
    const names = ['ישראל כהן', 'דוד לוי', 'נועה ישראלי', 'רון מזרחי', 'מיה בר', 'שיר אלון', 'אורי שמואלי', 'עדי פרידמן', 'לי קימחי', 'איתי סבן', 'אדל בר', 'אליטה כהן', 'מיכל לוי', 'דני ישראלי', 'רותם מזרחי'];
    
    
    const descriptions = [
      'בעיה בהתחברות למערכת הלימודים',
      'שאלה לגבי ציונים בקורס מתמטיקה',
      'בקשה לעזרה טכנית במחשב',
      'פנייה לגבי לוח זמנים של בחינות',
      'בעיה בהעלאת קובץ למטלה',
      'שאלה על חומר לימוד',
      'בקשה להארכת מועד הגשה',
      'בעיה בהדפסת מסמכים',
      'שאלה על נוכחות בשיעורים',
      'בקשה למידע על מלגות',
      'בעיה בגישה לספרייה הדיגיטלית',
      'שאלה על תכנית הלימודים',
      'בקשה לפגישה עם יועץ',
      'בעיה בהזמנת חדר לימוד',
      'שאלה על תשלום שכר לימוד'
    ];
    
    // Generate 15 demo requests with at least 3 for demo student ID
    return Array.from({ length: 15 }).map((_, i) => {
      const name = names[i % names.length];
      // Ensure 3+ requests belong to demo student ID 213233430
      const idNumber = i < 3 ? '213233430' : String(Math.floor(100000000 + Math.random() * 900000000)).padStart(9, '0');
      const email = generateEmailFromName(name);
      const role = Math.random() > 0.8 ? 'מנהל' : 'סטודנט';
      
      // Mix of statuses with some logic
      let status;
      if (i < 3) status = 'פתוחה'; // First 3 are open
      else if (i < 7) status = 'בטיפול'; // Next 4 are in progress
      else status = Math.random() > 0.5 ? 'נסגרה' : 'בטיפול';
      
      const details = descriptions[i] || `פנייה מספר ${i + 1} לגבי בעיה טכנית במערכת.`;
      const conversation = [
        { sender: 'סטודנט', text: details, timestamp: Date.now() - 1000 * 60 * 60 * (i + 1) },
      ];
      
      // Add some manager replies for closed requests
      if (status === 'נסגרה' && Math.random() > 0.5) {
        conversation.push({
          sender: 'מנהל',
          text: 'הפנייה טופלה בהצלחה. תודה על הפנייה.',
          timestamp: Date.now() - 1000 * 60 * 30 * (i + 1)
        });
      }
      
      const subjects = ['קורסים', 'מערכת שעות', 'בחינות ועבודות', 'אישורים ומסמכים', 'שכר לימוד', 'אחר'];
      const subjectPlaceholders = {
        'קורסים': 'בקשה לבירור בנושא קורסים',
        'מערכת שעות': 'בקשה לבירור בנושא מערכת שעות',
        'בחינות ועבודות': 'בקשת מידע על בחינה',
        'אישורים ומסמכים': 'בקשה לאישור או מסמך',
        'שכר לימוד': 'בקשה בנוגע לשכר לימוד',
        'אחר': 'בקשה כללית'
      };
      
      const selectedSubject = subjects[i % subjects.length];
      const now = new Date().toISOString();
      
      return { 
        idNumber, 
        name, 
        email, 
        role, 
        status, 
        subject: selectedSubject,
        details: details || subjectPlaceholders[selectedSubject as keyof typeof subjectPlaceholders], 
        attachments: [],
        createdAt: now,
        updatedAt: now,
        conversation 
      };
    });
  }
  
  // Default generic seed with id-like field
  const idField = entity.idField;
  return Array.from({ length: 10 }).map((_, i) => {
    const n = (i + 1).toString().padStart(3, '0');
    const base: Record<string, unknown> = { [idField]: `${entity.key}_${n}` };
    entity.fields.forEach((f) => {
      if (base[f.key] !== undefined) return;
      if (f.type === 'number') base[f.key] = i;
      else if (f.type === 'date') base[f.key] = '2024-10-10';
      else if (f.type === 'select') base[f.key] = f.selectOptions?.[0]?.value ?? '';
      else base[f.key] = `${f.label} ${n}`;
    });
    return base;
  });
};


