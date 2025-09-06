// src/components/TopNav.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router-dom';

// אם במסלולים שלך סטטיסטיקה נקראת אחרת, עדכני כאן
const STATS_PATH = '/statistics';

type AuthUser = {
  role?: 'admin' | 'student';
  idNumber?: string;
};

const getNavItems = (userRole: 'admin' | 'student') => {
  const items: Array<{ label: string; path: string }> = [
    { label: 'בית', path: '/' },
    {
      label: 'פניות',
      path: userRole === 'admin' ? '/admin/requests' : '/student/requests',
    },
  ];

  if (userRole === 'admin') {
    items.push({ label: 'ניהול משתמשים', path: '/admin/users' });
  }

  // ❗ בלי "יציאה" כאן – נשאר רק בתפריט המשתמש
  items.push(
    { label: 'סטטיסטיקה', path: STATS_PATH },
    { label: 'מדריך למשתמש', path: '/help' },
  );

  return items;
};

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchor);

  // קריאה בטוחה ל-localStorage כדי למנוע קריסות מ-JSON פגום
  let user: AuthUser | null = null;
  try {
    const raw = localStorage.getItem('blue-admin:user');
    user = raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    user = null;
  }

  const userRole: 'admin' | 'student' =
    user?.role === 'admin' ? 'admin' : 'student';
  const navItems = getNavItems(userRole);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleUserMenu = (e: React.MouseEvent<HTMLElement>) =>
    setUserMenuAnchor(e.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem('blue-admin:user');
    handleUserMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 1 }}>
        {/* תפריט מובייל */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleMenu}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="תפריט"
        >
          <MenuIcon />
        </IconButton>

        {/* כותרת האפליקציה – גדולה ובולטת */}
        <Button
          color="inherit"
          onClick={() => navigate('/')}
          aria-label="מערכת ניהול פניות"
          sx={{
            fontWeight: 900,
            textTransform: 'none',
            fontSize: { xs: '1.4rem', md: '1.9rem', lg: '2.1rem' },
            letterSpacing: 0.2,
          }}
        >
          מערכת ניהול פניות
        </Button>

        <Box sx={{ flex: 1 }} />

        {/* פריטי ניווט בדסקטופ */}
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

        {/* חיווי מחובר + תפריט משתמש */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Chip
              label={userRole === 'admin' ? 'מנהל' : 'סטודנט'}
              size="small"
              color="secondary"
              sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.25)' }}
            />
            <Tooltip title="פרטי משתמש">
              <IconButton color="inherit" size="small" onClick={handleUserMenu}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* תפריט מובייל */}
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose} keepMounted>
          {navItems.map((item) => (
            <MenuItem
              key={item.label}
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                handleMenuClose();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* תפריט משתמש */}
        <Menu
          anchorEl={userMenuAnchor}
          open={userMenuOpen}
          onClose={handleUserMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                {userRole === 'admin' ? 'מנהל' : 'סטודנט'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.idNumber ? `ת״ז: ${user.idNumber.slice(-4)}` : ''}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLogout}>יציאה</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
