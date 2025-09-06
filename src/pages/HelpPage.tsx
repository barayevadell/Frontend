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
  Chip,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'right', p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
        מדריך למשתמש
      </Typography>

      {/* פתיחת פנייה */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            פתיחת פנייה
          </Typography>
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
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • נושא (בחירה מרשימה)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • תיאור/פירוט
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
                      • צרופות (לא חובה)
                    </Typography>
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
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            התכתבות וצרופות
          </Typography>
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
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • סטודנט: כשהסטטוס "פתוחה" או "בטיפול"
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
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
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            סטטוסים
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Typography variant="body1" sx={{ textAlign: 'right' }}>נוצרה וממתינה לטיפול</Typography>
                    <Chip label="פתוחה" color="primary" size="small" />
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Typography variant="body1" sx={{ textAlign: 'right' }}>נפתחה/יש תגובה ממנהל (נפתח אוטומטית בעת צפייה/תגובה של מנהל)</Typography>
                    <Chip label="בטיפול" color="warning" size="small" />
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                    <Typography variant="body1" sx={{ textAlign: 'right' }}>הטיפול הסתיים; ההתכתבות לקריאה בלבד</Typography>
                    <Chip label="נסגרה" color="error" size="small" />
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* נושאים זמינים */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            נושאים זמינים
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="נושאים קבועים"
                secondary={
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                    {['קורסים', 'מערכת שעות', 'בחינות ועבודות', 'אישורים ומסמכים', 'שכר לימוד'].map((subject) => (
                      <Chip key={subject} label={subject} variant="outlined" size="small" />
                    ))}
                  </Box>
                }
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="אחר"
                secondary="ניתן להזין נושא חופשי"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* סטטיסטיקה */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            סטטיסטיקה
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="מה רואים בלשונית הסטטיסטיקה"
                secondary={
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • סה״כ פניות
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • פתוחות
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • נסגרו
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
                      • זמן תגובה ממוצע
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'right' }}>
                      • גרף עמודות
                    </Typography>
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
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            פרטיות ושמירת נתונים
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="שמירת נתונים"
                secondary="הנתונים נשמרים מקומית (localStorage) לתרגול/דמו"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* שאלות נפוצות */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            שאלות נפוצות (FAQ)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ textAlign: 'right' }}>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="למה איני רואה פניות?"
                secondary="ייתכן שאין פניות עבור המשתמש הנוכחי"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="כיצד לעדכן סטטוס?"
                secondary="מנהל: דרך דיאלוג ההצגה, 'סגור/י פנייה'"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <ListItem sx={{ textAlign: 'right' }}>
              <ListItemText 
                primary="מגבלת גודל קובץ ופורמטים"
                secondary="עד 5MB, תמונות (JPG, PNG, GIF), PDF, Word, טקסט"
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

    </Box>
  );
};

export default HelpPage;
