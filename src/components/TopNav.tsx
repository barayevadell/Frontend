// src/components/TopNav.tsx
import React from 'react';
import {
  AppBar, Toolbar, Button, IconButton, Menu, MenuItem, Box, Tooltip, Chip, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router-dom';

const STATS_PATH = '/statistics';

type AuthUser = { role?: 'admin' | 'student'; idNumber?: string };

const getNavItems = (role: 'admin' | 'student') => {
  const items = [
    { label: 'בית', path: '/' },
    { label: 'פניות', path: role === 'admin' ? '/admin/requests' : '/student/requests' },
  ];
  if (role === 'admin') items.push({ label: 'ניהול משתמשים', path: '/admin/users' });
  items.push({ label: 'סטטיסטיקה', path: STATS_PATH }, { label: 'מדריך למשתמש', path: '/help' });
  return items;
};

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileAnchor, setMobileAnchor] = React.useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = React.useState<null | HTMLElement>(null);

  let user: AuthUser | null = null;
  try { user = JSON.parse(localStorage.getItem('blue-admin:user') || 'null'); } catch { user = null; }

  const role: 'admin' | 'student' = user?.role === 'admin' ? 'admin' : 'student';
  const navItems = getNavItems(role);

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      {/* direction: 'rtl' מבטיח שהקבוצה הראשונה תתיישב לימין והשנייה לשמאל */}
      <Toolbar sx={{ direction: 'rtl', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        {/* ימין: תפריט מובייל + כותרת + ניווט דסקטופ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={(e) => setMobileAnchor(e.currentTarget)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            aria-label="תפריט"
          >
            <MenuIcon />
          </IconButton>

          <Button
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="מערכת ניהול פניות"
            sx={{ fontWeight: 900, textTransform: 'none', fontSize: { xs: '1.4rem', md: '1.9rem', lg: '2.1rem' } }}
          >
            מערכת ניהול פניות
          </Button>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                variant={location.pathname === item.path ? 'outlined' : 'text'}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* שמאל: חיווי ותפריט משתמש */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user && (
            <>
              <Chip
                label={role === 'admin' ? 'מנהל' : 'סטודנט'}
                size="small"
                color="secondary"
                sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.25)' }}
              />
              <Tooltip title="פרטי משתמש">
                <IconButton color="inherit" size="small" onClick={(e) => setUserAnchor(e.currentTarget)}>
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* תפריט מובייל */}
        <Menu
          anchorEl={mobileAnchor}
          open={Boolean(mobileAnchor)}
          onClose={() => setMobileAnchor(null)}
          keepMounted
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {navItems.map((item) => (
            <MenuItem
              key={item.label}
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileAnchor(null); }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* תפריט משתמש */}
        <Menu
          anchorEl={userAnchor}
          open={Boolean(userAnchor)}
          onClose={() => setUserAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                {role === 'admin' ? 'מנהל' : 'סטודנט'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.idNumber ? `ת״ז: ${user.idNumber.slice(-4)}` : ''}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { localStorage.removeItem('blue-admin:user'); setUserAnchor(null); navigate('/'); }}>
            יציאה
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
