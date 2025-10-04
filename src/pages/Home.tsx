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
import { readAll, writeAll } from '@lib/storage'; // ⚡ נשתמש בגרסה שמחוברת לפיירסטור
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

  // ✅ בדיקת Firestore ויצירת DEMO רק אם ריק
  React.useEffect(() => {
    const seedDemoData = async () => {
      try {
        // === בדיקת משתמשים ===
        const users = await readAll('users');
        if (!Array.isArray(users) || users.length === 0) {
          const now = new Date().toISOString();
          const demoUsers = [
            { idNumber: '213233430', fullName: 'ישראל כהן', role: 'מנהל' as Role, password: '213213' },
            { idNumber: '318754962', fullName: 'דוד לוי', role: 'סטודנט' as Role, password: '123123' },
            { idNumber: '205716483', fullName: 'מאיה כהן', role: 'סטודנט' as Role, password: '111111' },
            { idNumber: '319274856', fullName: 'שיר אלון', role: 'סטודנט' as Role, password: '222222' },
            { idNumber: '174205983', fullName: 'איתי סבן', role: 'סטודנט' as Role, password: '333333' },
            { idNumber: '487126395', fullName: 'רון מזרחי', role: 'סטודנט' as Role, password: '444444' },
          ].map((u) => ({
            ...u,
            email: generateEmailFromName(u.fullName),
            isActive: true,
            createdAt: now,
            updatedAt: now,
          }));

          await writeAllUsers(demoUsers);
          console.log('[Firestore SEED USERS] נוצרו', demoUsers.length, 'משתמשי דמו');
        }

        // === בדיקת פניות ===
        const requests = await readAll('requests');
        if (!Array.isArray(requests) || requests.length === 0) {
          const entity = ENTITIES.find((e) => e.key === 'requests');
          if (entity) {
            const seedData = getSeed(entity);
            if (Array.isArray(seedData) && seedData.length > 0) {
              await writeAll('requests', seedData);
              console.log('[Firestore SEED REQUESTS] נוצרו', seedData.length, 'פניות דמו');
            }
          }
        }
      } catch (err) {
        console.error('[HOME] שגיאה ביצירת נתוני דמו:', err);
      }
    };

    seedDemoData();
  }, []);

  // ✅ התחברות
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { idNumber?: string; password?: string } = {};
    if (!idNumber.trim()) nextErrors.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(idNumber)) nextErrors.idNumber = 'יש להזין מספר ת"ז בן 9 ספרות';
    if (!password.trim()) nextErrors.password = 'שדה חובה';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      try {
        const users = await readAll('users');
        const user = Array.isArray(users)
          ? users.find((u: any) => u.idNumber === idNumber && u.password === password)
          : null;

        // ✅ כניסת DEMO גלובלית — ללא קשר למה שיש בפיירסטור
        if (
          (idNumber === '213233430' && password === '213213') || // מנהל
          (idNumber === '318754962' && password === '123123')     // סטודנט
        ) {
          const isAdmin = idNumber === '213233430';
          setSuccess(true);
          setTimeout(() => navigate(isAdmin ? '/admin/requests' : '/student/requests'), 800);
          return;
        }

        if (!user) {
          setErrors({ idNumber: 'תעודת זהות או סיסמה שגויים' });
          return;
        }

        // מעבר לפי תפקיד
        const isAdmin = user.role === 'מנהל';
        setSuccess(true);
        setTimeout(() => navigate(isAdmin ? '/admin/requests' : '/student/requests'), 800);
      } catch (error) {
        console.error('[HOME] Failed to login:', error);
        setErrors({ idNumber: 'שגיאה בגישה לנתונים' });
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
      <Paper elevation={3} dir="rtl" sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          התחברות
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <RadioGroup
              row
              value={role}
              onChange={(_e, v) => setRole(v as Role)}
              sx={{ justifyContent: 'flex-end' }}
            >
              <FormControlLabel value="סטודנט" control={<Radio />} label="סטודנט" />
              <FormControlLabel value="מנהל" control={<Radio />} label="מנהל" />
            </RadioGroup>

            <TextField
              fullWidth
              required
              placeholder="תעודת זהות"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
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
            />

            <TextField
              fullWidth
              required
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            />
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
