/**
 * Central email generation utility
 * Generates deterministic, natural-looking emails from Hebrew names
 */

// -------------------------
// Basic Hebrew constants
// -------------------------
const NIKKUD = /[\u05B0-\u05BC\u05C1\u05C2]/g; // ניקוד ודגש
const HEB_PUNCT = /[׳״"]/g; // גרשיים/מירכאות

// תווי עיצור בעברית (לשימוש בהיוריסטיקות סביב ו/י)
const HEB_CONSONANTS = new Set([
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ך','ל','מ','ם','נ','ן','ס','ע','פ','ף','צ','ץ','ק','ר','ש','ת'
]);

// מפה בסיסית לאות→תעתיק (ללא ההיוריסטיקות של ו/י)
const BASE_MAP: Record<string, string> = {
  'א': '',  'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
  'ח': 'kh','ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
  'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '',  'פ': 'p', 'ף': 'f', 'צ': 'tz', 'ץ': 'tz',
  'ק': 'k', 'ר': 'r', 'ש': 'sh','ת': 't',
  // רווח וסימנים שכיחים
  ' ': ' ', '-': '-', '_': '_', "'": '', '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9'
};

// -------------------------
// Transcription helpers
// -------------------------
function isHebConsonant(ch?: string): boolean {
  return !!ch && HEB_CONSONANTS.has(ch);
}

function transliterateWord(wordHeb: string): string {
  // הסרת ניקוד/גרשיים למקרה שהגיעו משדות מועשרים
  const clean = wordHeb.replace(NIKKUD, '').replace(HEB_PUNCT, '');

  const chars = clean.split('');
  let out = '';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const prevH = chars[i - 1];
    const nextH = chars[i + 1];

    // היוריסטיקה ל־ו
    if (ch === 'ו') {
      const prevIsCons = isHebConsonant(prevH) && prevH !== 'ו' && prevH !== 'י';
      const nextIsCons = isHebConsonant(nextH) && nextH !== 'ו' && nextH !== 'י';

      // אם ו' בין/ליד עיצורים -> כנראה תנועה 'o'
      // תחילת מילה לפני עיצור, או סוף מילה אחרי עיצור – גם 'o'
      if (
        (prevIsCons && nextIsCons) ||
        (!prevH && nextIsCons) ||
        (prevIsCons && !nextH)
      ) {
        out += 'o';
      } else {
        out += 'v';
      }
      continue;
    }

    // היוריסטיקה ל־י
    if (ch === 'י') {
      if (i === 0) {
        // תחילת מילה נשמע יותר 'y' (Yael, Yarden)
        out += 'y';
      } else {
        // באמצע/סוף מילה – לרוב תנועה i (Miki, Dvir)
        out += 'i';
      }
      continue;
    }

    // ברירת מחדל לפי מפה
    out += (BASE_MAP[ch] ?? ch);
  }

  return out;
}

function compressRepeats(s: string): string {
  // aa -> a, kkk -> k ; אבל נשמור צירופים כמו 'sh','tz','kh' (דחיסה חכמה)
  // נתחיל מדחיסה כללית ואז נחזיר מקרים שפגענו בהם
  let r = s.replace(/([a-z])\1{1,}/gi, '$1');

  // תיקון רך לצירופים דו-אותיים אם חוברו בטעות
  r = r
    .replace(/s+h/gi, 'sh')
    .replace(/t+z/gi, 'tz')
    .replace(/k+h/gi, 'kh');

  return r;
}

function normalizeLatin(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')   // ריבוי רווחים -> רווח אחד
    .replace(/-+/g, '-')    // ריבוי מקפים -> מקף אחד
    .replace(/\.+/g, '.')   // ריבוי נקודות -> נקודה אחת
    .replace(/[^a-zA-Z0-9.\-_\s]/g, '') // ניקוי תווים שאינם רלוונטיים
    .trim();
}

// -------------------------
// Public API
// -------------------------
/**
 * Generates a deterministic, natural-looking email from a Hebrew full name.
 *
 * Examples:
 * "רן בר" → "ran.bar@gmail.com"
 * "מאיה כהן לוי" → "maya.kohen.levi@gmail.com"
 * "אור-אל מזרחי" → "or-el.mizrahi@gmail.com"
 * "צבי חיון" → "tzvi.khiyon@gmail.com"
 */
export function generateEmailFromName(hebrewName: string): string {
  if (!hebrewName || typeof hebrewName !== 'string') return 'user@gmail.com';

  // ניקוי ראשוני עדין – בלי למחוק עברית
  const basic = hebrewName
    .replace(NIKKUD, '')
    .replace(HEB_PUNCT, '')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim();
  if (!basic) return 'user@gmail.com';

  // תעתיק מילה-מילה כדי לאפשר הקשרים
  const latinWords = basic
    .split(' ')
    .filter(Boolean)
    .map(w => compressRepeats(transliterateWord(w)));

  const transliterated = latinWords.join(' ');
  const normalized = normalizeLatin(transliterated).toLowerCase();
  if (!normalized) return 'user@gmail.com';

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'user@gmail.com';

  const local = parts
    .join('.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')
    .replace(/-+/g, '-');

  return local ? `${local}@gmail.com` : 'user@gmail.com';
}

/** Exact-match validation of an email for a given name */
export function isEmailValidForName(email: string, name: string): boolean {
  if (!email || !name) return false;
  return email === generateEmailFromName(name);
}

/** Bulk migration utility: fixes 'email' field based on 'name' */
export function migrateEmailsInData<T extends { name?: string; email?: string }>(
  data: T[]
): { updatedData: T[]; fixedCount: number } {
  let fixedCount = 0;
  const updatedData = data.map(item => {
    if (!item?.name) return item;
    const expected = generateEmailFromName(item.name);
    if (item.email !== expected) {
      fixedCount++;
      return { ...item, email: expected };
    }
    return item;
  });
  return { updatedData, fixedCount };
}
