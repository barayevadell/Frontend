import { createTheme, alpha } from '@mui/material/styles';

// Manually derived light/dark variants (~15%) to avoid extra deps
const PRIMARY_MAIN = '#646cff';
const PRIMARY_LIGHT = '#8a90ff';
const PRIMARY_DARK = '#4f57cc';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: PRIMARY_MAIN,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#fff',
    },
    background: {
      default: '#f7f9ff',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontSize: 16, // increase base font size for better readability
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.75rem', fontWeight: 700 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '1rem' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:nth-of-type(odd)': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.67),
          color: theme.palette.primary.contrastText,
        }),
      },
    },
  },
});

export const brandAlpha = (opacity = 0.67) => alpha(PRIMARY_MAIN, opacity);


