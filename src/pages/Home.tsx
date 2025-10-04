// src/pages/Home.tsx
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

// Storage helpers (your project wires these to Firestore/localStorage)
import { readAll, writeAll, writeAllUsers } from '@lib/storage';
import { ENTITIES } from '@config/entities';
import { getSeed } from '../data/seed';
import { useNavigate } from 'react-router-dom';
import { generateEmailFromName } from '@lib/emailGenerator';

type Role = 'סטודנט' | 'מנהל';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // UI state
  const [role, setRole] = React.useState<Role>('סטודנט');
  const [idNumber, setIdNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ idNumber?: string; password?: string }>({});
  const [success, setSuccess] = React.useState(false);

  // --- DEMO ACCOUNTS (ONLY these two) ---
  const DEMO = {
    admin:   { id: '214305047', pass: '123123' },
    student: { id: '213233430', pass: '213213' },
  } as const;

  // Seed demo data if empty (users + requests)
  React.useEffect(() => {
    const seedDemoData = async () => {
      try {
        // Seed Users if empty
        const users = await readAll('users');
        if (!Array.isArray(users) || users.length === 0) {
          const now = new Date().toISOString();

          const demoUsers = [
            { idNumber: DEMO.admin.id,   fullName: 'ישראל כהן', role: 'מנהל' as Role,   password: DEMO.admin.pass },
            { idNumber: DEMO.student.id, fullName: 'נועם אברהמי', role: 'סטודנט' as Role, password: DEMO.student.pass },
          ].map((u) => ({
            ...u,
            email: generateEmailFromName(u.fullName),
            isActive: true,
            createdAt: now,
            updatedAt: now,
          }));

          await writeAllUsers(demoUsers);
          if ((import.meta as any).env?.DEV) {
            console.log('[SEED USERS] created', demoUsers.length);
          }
        }

        // Seed Requests if empty
        const requests = await readAll('requests');
        if (!Array.isArray(requests) || requests.length === 0) {
          const entity = ENTITIES.find((e) => e.key === 'requests');
          if (entity) {
            const seedData = getSeed(entity);
            if (Array.isArray(seedData) && seedData.length > 0) {
              await writeAll('requests', seedData);
              if ((import.meta as any).env?.DEV) {
                console.log('[SEED REQUESTS] created', seedData.length);
              }
            }
          }
        }
      } catch (err) {
        console.error('[HOME] demo seeding failed:', err);
      }
    };

    seedDemoData();
  }, []);

  // Map Hebrew roles to the app guard roles
  const toAppRole = (r: Role | string) => (r === 'מנהל' ? 'admin' : 'student');

  // Handle Login (demo + regular from storage)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const nextErrors: { idNumber?: string; password?: string } = {};
    if (!idNumber.trim()) nextErrors.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(idNumber)) nextErrors.idNumber = 'יש להזין מספר ת"ז בן 9 ספרות';
    if (!password.trim()) nextErrors.password = 'שדה חובה';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // DEMO logins (exactly two)
      if (idNumber === DEMO.admin.id && password === DEMO.admin.pass) {
        localStorage.setItem('blue-admin:user', JSON.stringify({ role: 'admin', idNumber }));
        setSuccess(true);
        setTimeout(() => navigate('/admin/requests'), 600);
        return;
      }
      if (idNumber === DEMO.student.id && password === DEMO.student.pass) {
        localStorage.setItem('blue-admin:user', JSON.stringify({ role: 'student', idNumber }));
        setSuccess(true);
        setTimeout(() => navigate('/student/requests'), 600);
        return;
      }

      // Regular login (from storage/Firestore)
      const users = await readAll('users');
      const user = Array.isArray(users)
        ? users.find((u: any) => u.idNumber === idNumber && u.password === password)
        : null;

      if (!user) {
        setErrors({ idNumber: 'תעודת זהות או סיסמה שגויים' });
        return;
      }

      const appRole = toAppRole(user.role);
      localStorage.setItem('blue-admin:user', JSON.stringify({ role: appRole, idNumber: user.idNumber }));
      setSuccess(true);
      setTimeout(() => {
        if (appRole === 'admin') navigate('/admin/requests');
        else navigate('/student/requests');
      }, 600);
    } catch (error) {
      console.error('[HOME] login failed:', error);
      setErrors({ idNumber: 'שגיאה בגישה לנתונים' });
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
      {/* RTL keeps labels/inputs right-aligned */}
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
              aria-label="בחירת תפקיד"
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
              label=""
              InputLabelProps={{ shrink: false }}
              FormHelperTextProps={{ sx: { textAlign: 'right', m: 0 } }}
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
              label=""
              InputLabelProps={{ shrink: false }}
              FormHelperTextProps={{ sx: { textAlign: 'right', m: 0 } }}
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
