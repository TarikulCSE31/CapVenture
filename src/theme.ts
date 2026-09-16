import { createTheme, PaletteMode } from '@mui/material';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Material Blue
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#9c27b0', // Material Purple
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      success: {
        main: '#2e7d32', // Material Forest Green
        light: '#4caf50',
        dark: '#1b5e20',
      },
      warning: {
        main: '#ed6c02', // Material Amber
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1', // Material Cyan
        light: '#03a9f4',
        dark: '#01579b',
      },
      background: {
        default: mode === 'dark' ? '#0a0e17' : '#f8fafc',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f3f4f6' : '#1e293b',
        secondary: mode === 'dark' ? '#9ca3af' : '#64748b',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
      h6: {
        fontWeight: 700,
      },
      subtitle1: {
        fontWeight: 600,
      },
      subtitle2: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '7px 16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === 'dark'
                ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            padding: '12px 16px',
          },
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: mode === 'dark' ? '#0d131f' : '#f1f5f9',
            color: mode === 'dark' ? '#9ca3af' : '#475569',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'outlined',
        },
      },
    },
  });
