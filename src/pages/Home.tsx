import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { exists, readAll, writeAll } from '@lib/storage';
import { writeAllUsers } from '@lib/storage';
import { ENTITIES } from '@config/entities';
import { getSeed } from '../data/seed';
import { useNavigate } from 'react-router-dom';
import { generateEmailFromName } from '@lib/emailGenerator';

type Role = 'סטודנט' | 'מנהל';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<Role>('סטודנט');
  const [idNumber, setIdNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ idNumber?: string; password?: string }>({});
  const [success, setSuccess] = React.useState(false);

  // --- SEED: משתמשים + פניות (בפעם הראשונה) ---
  React.useEffect(() => {
    try {
      // 1) Users – אם חסר/ריק, נזריע 12 משתמשים במבנה שמסך הניהול מצפה לו
      const usersKey = 'users';
      const hasUsers = exists(usersKey);
      const usersItems = readAll(usersKey) || [];
      if (!hasUsers || usersItems.length === 0) {
        const nowISO = new Date().toISOString();
        const usersSeed = [
          { idNumber: '213233430', fullName: 'ישראל כהן',   role: 'מנהל'   as Role },
          { idNumber: '318754962', fullName: 'דוד לוי',     role: 'סטודנט' as Role },
          { idNumber: '205716483', fullName: 'מאיה כהן',     role: 'סטודנט' as Role },
          { idNumber: '319274856', fullName: 'שיר אלון',     role: 'סטודנט' as Role },
          { idNumber: '174205983', fullName: 'איתי סבן',     role: 'סטודנט' as Role },
          { idNumber: '487126395', fullName: 'רון מזרחי',    role: 'סטודנט' as Role },
          { idNumber: '629781453', fullName: 'נויה ישראלי',  role: 'סטודנט' as Role },
          { idNumber: '058392174', fullName: 'עדי פרידמן',   role: 'סטודנט' as Role }, // מתחיל ב-0 כמחרוזת — זה בסדר
          { idNumber: '913462587', fullName: 'ליא קמחי',     role: 'סטודנט' as Role },
          { idNumber: '732915846', fullName: 'אורי שמואלי',  role: 'סטודנט' as Role },
          { idNumber: '486231975', fullName: 'מיה בר',       role: 'סטודנט' as Role },
          { idNumber: '569842731', fullName: 'שי בן חמו',    role: 'סטודנט' as Role },
        ].map(u => ({
          ...u,
          email: generateEmailFromName(u.fullName),
          isActive: true,
          createdAt: nowISO,
          updatedAt: nowISO,
        }));

        writeAllUsers(usersSeed);
        if ((import.meta as any).env?.DEV) {
          console.log('[SEED USERS DONE]', usersSeed.length);
        }
      }

      // 2) Requests – לפי המנגנון הקיים שלך (ENTITIES/getSeed), לא נוגעים אם כבר יש
      const requestsEntity = ENTITIES.find((e) => e.key === 'requests');
      if (requestsEntity) {
        const hasReq = exists(requestsEntity.key);
        const items = readAll(requestsEntity.key) || [];
        if (!hasReq || items.length === 0) {
          const seedData = getSeed(requestsEntity);
          if (Array.isArray(seedData)) {
            writeAll(requestsEntity.key, seedData);
            if ((import.meta as any).env?.DEV) {
              console.log('[SEED REQUESTS DONE]', seedData.length);
            }
          }
        }
      }
    } catch (error) {
      console.error('[HOME] Seeding failed:', error);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { idNumber?: string; password?: string } = {};
    if (!idNumber.trim()) nextErrors.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(idNumber)) nextErrors.idNumber = 'יש להזין מספר תעודת זהות בן 9 ספרות';
    if (!password.trim()) nextErrors.password = 'שדה חובה';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // Demo credentials (כניסה מיידית לדמו)
      const isDemoUser = idNumber === '213233430' && password === '213213';
      if (!isDemoUser) {
        setErrors({ idNumber: 'תעודת זהות או סיסמה שגויים' });
        return;
      }

      try {
        const userRole = role === 'מנהל' ? 'admin' : 'student';
        const userData = { role: userRole, idNumber };
        localStorage.setItem('blue-admin:user', JSON.stringify(userData));
        setSuccess(true);
        if (userRole === 'admin') navigate('/admin/requests');
        else navigate('/student/requests');
      } catch (error) {
        console.error('[HOME] Failed to save user data]:', error);
        setErrors({ idNumber: 'שגיאה בשמירת נתוני המשתמש' });
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: { xs: 6, md: 10 },
        pb: 6,
        px: 2,
        textAlign: 'right',
      }}
    >
      <Paper
        elevation={3}
        dir="rtl"
        sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 3 }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          התחברות
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* במקום Grid: CSS Grid עם Box — עובד בכל גרסה */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 2,
            }}
          >
            {/* בחירת תפקיד */}
            <Box>
              <RadioGroup
                row
                value={role}
                onChange={(_e, v) => setRole(v as Role)}
                aria-label="בחירת תפקיד"
                sx={{ justifyContent: 'flex-end' }}
              >
                <FormControlLabel value="סטודנט" control={<Radio />} label="סטודנט" />
                <FormControlLabel value="מנהל" control={<Radio />} label="מנהל" />
              </RadioGroup>
            </Box>

            {/* תעודת זהות */}
            <Box>
              <TextField
                fullWidth
                required
                placeholder="תעודת זהות"
                value={idNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdNumber(e.target.value)}
                error={Boolean(errors.idNumber)}
                helperText={errors.idNumber || ' '}
                inputProps={{ maxLength: 9, style: { textAlign: 'right' } }}
                InputProps={{
                  notched: false,
                  endAdornment: (
                    <InputAdornment position="end">
                      <BadgeOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                label=""
                InputLabelProps={{ shrink: false }}
                FormHelperTextProps={{ sx: { textAlign: 'right', m: 0 } }}
              />
            </Box>

            {/* סיסמה */}
            <Box>
              <TextField
                fullWidth
                required
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password || ' '}
                inputProps={{ style: { textAlign: 'right' } }}
                InputProps={{
                  notched: false,
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                label=""
                InputLabelProps={{ shrink: false }}
                FormHelperTextProps={{ sx: { textAlign: 'right', m: 0 } }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained">
              התחברות
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)}>
        <Alert severity="success" variant="filled">
          התחברת בהצלחה
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
