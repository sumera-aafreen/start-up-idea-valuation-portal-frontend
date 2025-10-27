import { createTheme, PaletteMode, responsiveFontSizes } from '@mui/material/styles';

// Shared royal palette values
const PRIMARY_MAIN = '#4F46E5'; // indigo-600
const PRIMARY_DARK = '#3730A3';
const PRIMARY_LIGHT = '#8B83FF';
const ACCENT = '#C084FC';
const BG_LIGHT = '#F6F8FC';
const BG_DARK = '#0B1020';

export const getAppTheme = (mode: PaletteMode) =>
  responsiveFontSizes(
    createTheme({
    palette: {
      mode,
      primary: {
        main: PRIMARY_MAIN,
        dark: PRIMARY_DARK,
        light: PRIMARY_LIGHT,
        contrastText: '#ffffff',
      },
      secondary: {
        main: ACCENT,
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? BG_LIGHT : BG_DARK,
        paper: mode === 'light' ? '#ffffff' : '#071027',
      },
      text: {
        primary: mode === 'light' ? '#111827' : '#E6EEF8',
        secondary: mode === 'light' ? '#4B5563' : '#9FB3D9',
      },
    },
    typography: {
      fontFamily: "'Poppins', 'Inter', 'Roboto', sans-serif",
      h3: { fontWeight: 800, fontSize: '2.1rem' },
      h4: { fontWeight: 800, fontSize: '1.5rem' },
      h5: { fontWeight: 700 },
      body1: { fontSize: '1rem' },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiContainer: {
        defaultProps: {
          maxWidth: 'lg',
          disableGutters: false,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            // provide comfortable default gutters and responsive padding
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
              paddingLeft: theme.spacing(3),
              paddingRight: theme.spacing(3),
            },
            [theme.breakpoints.up('md')]: {
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 14,
            padding: theme.spacing(3),
            minHeight: 220,
            boxShadow:
              mode === 'light'
                ? '0 14px 40px rgba(15,23,42,0.08)'
                : '0 14px 40px rgba(2,6,23,0.7)',
            transition: 'transform 300ms ease, box-shadow 300ms ease, border 200ms ease',
            background:
              mode === 'light'
                ? 'linear-gradient(180deg, #ffffff, #fbfbff)'
                : 'linear-gradient(180deg, rgba(12,18,34,0.6), rgba(6,12,22,0.85))',
            border: mode === 'light' ? '1px solid rgba(15,23,42,0.04)' : '1px solid rgba(255,255,255,0.04)',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background 200ms ease, color 200ms ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: ({ theme }) => ({
            background: `linear-gradient(90deg, ${PRIMARY_MAIN}, ${ACCENT})`,
            color: '#fff',
            boxShadow: '0 8px 20px rgba(79,70,229,0.15)',
            '&:hover': { filter: 'brightness(0.95)' },
          }),
          root: {
            borderRadius: 10,
            padding: '8px 18px',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: mode === 'light' ? `linear-gradient(90deg, ${PRIMARY_MAIN}, ${ACCENT})` : 'linear-gradient(90deg,#071027,#021021)',
            color: '#fff',
            boxShadow: '0 6px 24px rgba(2,6,23,0.36)'
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: 'rgba(17,24,39,0.95)',
            color: '#fff',
            fontSize: '0.85rem',
            borderRadius: 8,
          },
        },
      },
    },
    })
  );

export default getAppTheme;


