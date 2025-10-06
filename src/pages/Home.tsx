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
  Checkbox,
  FormGroup,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { readAll } from '@lib/storage';
import { useNavigate } from 'react-router-dom';

type Role = 'סטודנט' | 'מנהל';

const BearAvatar: React.FC<{
  state: 'idle' | 'typing' | 'cover' | 'peek';
  eyeProgress?: number;
}> = ({ state, eyeProgress = 0 }) => {
  const maxShift = 8;
  const shift =
    state === 'typing'
      ? Math.max(0, Math.min(maxShift, maxShift - eyeProgress * 2))
      : 0;
  const down = state === 'typing' ? 4 : 0;
  const isCover = state === 'cover';
  const isPeek = state === 'peek';

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <div
        style={{
          width: 110,
          height: 110,
          margin: 'auto',
          borderRadius: '50%',
          background: '#e7dcff',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          transform:
            state === 'typing'
              ? 'translateY(-2px)'
              : state === 'cover'
              ? 'scale(1.05)'
              : state === 'peek'
              ? 'translateY(-1px)'
              : 'translateY(0)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 18,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#c6b5f0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 18,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#c6b5f0',
          }}
        />
        <div
          style={{
            width: 70,
            height: 70,
            background: '#fff',
            borderRadius: '50%',
            margin: '20px auto',
            position: 'relative',
            border: '3px solid #c6b5f0',
            overflow: 'hidden',
          }}
        >
          {['left', 'right'].map((side) => {
            const isRight = side === 'right';
            const shouldHide = isCover || (isPeek && !isRight);
            return (
              <div
                key={side}
                style={{
                  position: 'absolute',
                  top: 20,
                  [isRight ? 'right' : 'left']: 12,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: shouldHide ? '#c6b5f0' : '#fff',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  boxShadow: shouldHide ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                }}
              >
                {!shouldHide && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8 + down,
                      left: 6 + shift,
                      width: 10,
                      height: 10,
                      background: 'black',
                      borderRadius: '50%',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        width: 3,
                        height: 3,
                        background: 'white',
                        borderRadius: '50%',
                      }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
          <div
            style={{
              position: 'absolute',
              top: 43,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 22,
              height: 13,
              borderRadius: '50%',
              background: '#e4c8ff',
              boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0,0.15)',
            }}
          />
          {(isCover || isPeek) && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: 25,
                  left: 2,
                  width: 36,
                  height: 24,
                  background: '#c6b5f0',
                  borderRadius: '20px',
                  transform: 'rotate(-25deg)',
                  transition: 'all 0.4s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: isPeek ? 10 : 25,
                  right: 2,
                  width: 36,
                  height: 24,
                  background: '#c6b5f0',
                  borderRadius: '20px',
                  transform: isPeek ? 'rotate(10deg)' : 'rotate(25deg)',
                  transition: 'all 0.4s ease',
                }}
              />
            </>
          )}
        </div>
      </div>
    </Box>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<Role>('סטודנט');
  const [idNumber, setIdNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ idNumber?: string; password?: string }>({});
  const [success, setSuccess] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [focusField, setFocusField] = React.useState<'none' | 'id' | 'password'>('none');
  const [eyeProgress, setEyeProgress] = React.useState(0);
  const [avatarState, setAvatarState] = React.useState<'idle' | 'typing' | 'cover' | 'peek'>('idle');

  // ✅ שמרנו רק את משתמשי הדמו לכניסה (לא נוצר כלום במסד)
  const DEMO = {
    admin: { id: '214305047', pass: '123123' },
    student: { id: '213233430', pass: '213213' },
  } as const;

  const toAppRole = (r: Role | string) => (r === 'מנהל' ? 'admin' : 'student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { idNumber?: string; password?: string } = {};
    if (!idNumber.trim()) nextErrors.idNumber = 'שדה חובה';
    else if (!/^\d{9}$/.test(idNumber)) nextErrors.idNumber = 'יש להזין מספר ת"ז בן 9 ספרות';
    if (!password.trim()) nextErrors.password = 'שדה חובה';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // ✅ מאפשר כניסה עם משתמשי הדמו בלבד
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

    // 🔒 אם מישהו לא דמו – נבדוק אם קיים במשתמשים אמיתיים
    try {
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

  React.useEffect(() => {
    if (password.trim().length > 0) {
      if (showPassword) setAvatarState('peek');
      else setAvatarState('cover');
    } else if (focusField === 'id') {
      setAvatarState('typing');
    } else {
      setAvatarState('idle');
    }
  }, [focusField, showPassword, password]);

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
        <BearAvatar state={avatarState} eyeProgress={eyeProgress} />
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          התחברות
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <RadioGroup
            row
            value={role}
            onChange={(_e, v) => setRole(v as Role)}
            aria-label="בחירת תפקיד"
            sx={{ justifyContent: 'flex-end', mb: 2 }}
          >
            <FormControlLabel value="סטודנט" control={<Radio />} label="סטודנט" />
            <FormControlLabel value="מנהל" control={<Radio />} label="מנהל" />
          </RadioGroup>

          <TextField
            fullWidth
            required
            placeholder="תעודת זהות"
            value={idNumber}
            onFocus={() => setFocusField('id')}
            onBlur={() => setFocusField('none')}
            onChange={(e) => {
              const val = e.target.value.slice(0, 9);
              setIdNumber(val);
              setEyeProgress(val.length);
            }}
            error={Boolean(errors.idNumber)}
            helperText={errors.idNumber || ' '}
            inputProps={{ maxLength: 9, style: { textAlign: 'right' } }}
            InputProps={{
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
            type={showPassword ? 'text' : 'password'}
            placeholder="סיסמה"
            value={password}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField('none')}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password || ' '}
            inputProps={{ style: { textAlign: 'right' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LockOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormGroup sx={{ mt: 1, textAlign: 'right' }}>
            <FormControlLabel
              control={<Checkbox checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />}
              label="הצג סיסמה"
            />
          </FormGroup>

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
