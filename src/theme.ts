import { createTheme, PaletteMode } from '@mui/material';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#3b82f6' : '#1976d2',
        light: mode === 'dark' ? '#60a5fa' : '#42a5f5',
        dark: mode === 'dark' ? '#2563eb' : '#1565c0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'dark' ? '#c084fc' : '#9c27b0',
        light: mode === 'dark' ? '#e9d5ff' : '#ba68c8',
        dark: mode === 'dark' ? '#9333ea' : '#7b1fa2',
        contrastText: '#ffffff',
      },
      success: {
        main: mode === 'dark' ? '#4ade80' : '#16a34a',
        light: mode === 'dark' ? '#86efac' : '#22c55e',
        dark: mode === 'dark' ? '#22c55e' : '#15803d',
        contrastText: mode === 'dark' ? '#0f172a' : '#ffffff',
      },
      warning: {
        main: mode === 'dark' ? '#fbbf24' : '#d97706',
        light: mode === 'dark' ? '#fde68a' : '#f59e0b',
        dark: mode === 'dark' ? '#f59e0b' : '#b45309',
        contrastText: mode === 'dark' ? '#0f172a' : '#ffffff',
      },
      info: {
        main: mode === 'dark' ? '#38bdf8' : '#0288d1',
        light: mode === 'dark' ? '#7dd3fc' : '#03a9f4',
        dark: mode === 'dark' ? '#0284c7' : '#01579b',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#0b0f19' : '#f8fafc',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f9fafb' : '#0f172a',
        secondary: mode === 'dark' ? '#9ca3af' : '#64748b',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      action: {
        active: mode === 'dark' ? '#cbd5e1' : '#64748b',
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        selected: mode === 'dark' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(25, 118, 210, 0.08)',
      },
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
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          html: {
            colorScheme: mode,
          },
          body: {
            colorScheme: mode,
          },
          'input, select, textarea': {
            colorScheme: mode,
          },
          'input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator': {
            cursor: 'pointer',
            opacity: mode === 'dark' ? 0.9 : 0.7,
            '&:hover': {
              opacity: 1,
            },
          },
        },
      },
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
                ? '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
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
            backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
          },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            '&:hover': {
              color: mode === 'dark' ? '#f9fafb' : '#0f172a',
            },
            '&.Mui-active': {
              color: mode === 'dark' ? '#60a5fa' : '#1976d2',
              '& .MuiTableSortLabel-icon': {
                color: mode === 'dark' ? '#60a5fa !important' : '#1976d2 !important',
              },
            },
          },
          icon: {
            opacity: 0.7,
            color: 'inherit',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#9ca3af' : '#64748b',
            '&.Mui-selected': {
              color: mode === 'dark' ? '#60a5fa' : '#1976d2',
            },
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
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#f9fafb' : '#0f172a',
            backgroundColor: mode === 'dark' ? '#111827' : '#ffffff',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#cbd5e1' : '#475569',
            '&:hover': {
              color: mode === 'dark' ? '#ffffff' : '#0f172a',
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'outlined',
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            colorScheme: mode,
          },
          input: {
            colorScheme: mode,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            colorScheme: mode,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8',
            },
          },
          input: {
            colorScheme: mode,
          },
        },
      },
    },
  });
