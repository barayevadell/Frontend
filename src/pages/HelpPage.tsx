import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const summarySX = {
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-content': {
    margin: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    ml: 1,
  },
} as const;

const HelpPage: React.FC = () => {
  return (
    <Box dir="rtl" sx={{ textAlign: 'right', p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        מדריך למשתמש
      </Typography>

      {/* פתיחת פנייה */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>פתיחת פנייה</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="איך מגיעים לפורמט 'פניה חדשה'"
                secondary="מהעמוד 'פניות' בצד הסטודנט, לחצו על כפתור 'פניה חדשה'"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="שדות חובה"
                secondary={
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• נושא (בחירה מרשימה)</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• תיאור/פירוט</Typography>
                    <Typography variant="body2">• צרופות (לא חובה)</Typography>
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="מגבלת קובץ"
                secondary="עד 5MB, סוגי קבצים מקובלים: תמונות, PDF, Word, טקסט"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="לאחר שליחה"
                secondary="תופיע הודעה: 'הפניה הוגשה'"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* התכתבות וצרופות */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>התכתבות וצרופות</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="צפייה בפנייה"
                secondary="לחצו על 'הצגה' לראות פרטי הפנייה והתכתבות"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="הוספת תגובה"
                secondary={
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      • סטודנט: כשהסטטוס "פתוחה" או "בטיפול"
                    </Typography>
                    <Typography variant="body2">
                      • מנהל: תמיד יכול להגיב
                    </Typography>
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="צירוף קובץ לתגובה"
                secondary="ניתן לצרף קבצים לתגובות. רואים את שם הקובץ/גודל ואפשרות לפתיחה"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* סטטוסים */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>סטטוסים</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ textAlign: 'right', pr: 2, direction: 'rtl' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>• פתוחה – הפנייה נוצרה וממתינה לטיפול.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• בטיפול – מנהל פתח את הפנייה או הגיב עליה; הפנייה בטיפול פעיל.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• נסגרה – הטיפול הסתיים והפנייה ננעלה לקריאה בלבד.</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* נושאים זמינים */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>נושאים זמינים</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ textAlign: 'right', pr: 2, direction: 'rtl' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>• קורסים – שאלות על תכני קורס, מרצים, ציונים או חומרי למידה.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• מערכת שעות – בירורים על מערכת שעות, שינויים או התנגשויות.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• בחינות ועבודות – בקשות להארכה, בירור ציונים או מועדים מיוחדים.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• אישורים ומסמכים – הנפקת אישורי לימודים, אישורי סיום או תעודות.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• שכר לימוד – בירור תשלומים, הנחות, מלגות או חשבוניות.</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>• אחר – נושא חופשי שאינו נכלל באחת הקטגוריות הקודמות.</Typography>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              ניתן לפרט ולהרחיב את הנושא בתוך הפנייה עצמה.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* סטטיסטיקה */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>סטטיסטיקה</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="מה רואים בלשונית הסטטיסטיקה"
                secondary={
                  <Box sx={{ textAlign: 'right', direction: 'rtl' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• סה״כ פניות</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• פתוחות</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• נסגרו</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• זמן תגובה ממוצע</Typography>
                    <Typography variant="body2">• גרף עמודות</Typography>
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* פרטיות ושמירת נתונים */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>פרטיות ושמירת נתונים</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText
                primary="שמירת נתונים"
                secondary="הנתונים נשמרים במאגר Firestore מאובטח של Google, תוך הקפדה על פרטיות ואבטחת מידע מלאה."
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* שאלות נפוצות */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySX}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>שאלות נפוצות (FAQ)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            {/* שאלות קיימות */}
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="למה איני רואה פניות?" secondary="ייתכן שאין פניות עבור המשתמש הנוכחי" />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="כיצד לעדכן סטטוס?" secondary="מנהל: דרך דיאלוג ההצגה, 'סגור/י פנייה'" />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="מגבלת גודל קובץ ופורמטים" secondary="עד 5MB, תמונות (JPG, PNG, GIF), PDF, Word, טקסט" />
            </ListItem>

            {/* שאלות חדשות */}
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="איך יודעים אם פנייה נשלחה בהצלחה?" secondary="לאחר השליחה תופיע הודעה 'הפנייה הוגשה' והפנייה תופיע ברשימת הפניות שלך." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="האם ניתן לבטל פנייה שנשלחה בטעות?" secondary="לא ניתן לבטל פנייה לאחר השליחה, אך ניתן להוסיף תגובה למנהל עם בקשה לביטול." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="האם ניתן לפתוח כמה פניות במקביל?" secondary="כן, אין הגבלה על מספר הפניות הפעילות בו־זמנית." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="מה קורה אם הקובץ לא נטען?" secondary="בדוק את גודל הקובץ והפורמט. אם עדיין לא עובד – נסה לרענן את הדפדפן או לפתוח ממחשב אחר." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="האם אפשר להוסיף תגובה אחרי שהפנייה נסגרה?" secondary="לא. פנייה סגורה נועדה לקריאה בלבד." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="המערכת לא נטענת / נתקעת – מה לעשות?" secondary="נסה לרענן את העמוד או לנקות את ה־cache של הדפדפן. אם זה לא עוזר – פנה לתמיכה." />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText primary="יש לי הצעה לשיפור – איך אפשר לדווח?" secondary='ניתן לפתוח פנייה חדשה תחת הנושא "אחר" ולפרט את ההצעה שלך.' />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default HelpPage;
