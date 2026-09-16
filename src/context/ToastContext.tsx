import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface ToastContextType {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalToastHandler: ToastContextType | null = null;

/**
 * Direct global toast dispatchers (usable from anywhere, including callbacks)
 */
export const toast = {
  success: (message: string, duration?: number) => {
    if (globalToastHandler) globalToastHandler.showSuccess(message, duration);
  },
  error: (message: string, duration?: number) => {
    if (globalToastHandler) globalToastHandler.showError(message, duration);
  },
  info: (message: string, duration?: number) => {
    if (globalToastHandler) globalToastHandler.showInfo(message, duration);
  },
  warning: (message: string, duration?: number) => {
    if (globalToastHandler) globalToastHandler.showWarning(message, duration);
  },
  show: (message: string, severity?: AlertColor, duration?: number) => {
    if (globalToastHandler) globalToastHandler.showToast(message, severity, duration);
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastState, setToastState] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
    duration: number;
    key: number;
  }>({
    open: false,
    message: '',
    severity: 'success',
    duration: 3500,
    key: 0,
  });

  const showToast = useCallback(
    (message: string, severity: AlertColor = 'success', duration: number = 3500) => {
      setToastState({
        open: true,
        message,
        severity,
        duration,
        key: Date.now(),
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  useEffect(() => {
    globalToastHandler = { showToast, showSuccess, showError, showInfo, showWarning };
    return () => {
      globalToastHandler = null;
    };
  }, [showToast, showSuccess, showError, showInfo, showWarning]);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToastState((prev) => ({ ...prev, open: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <Snackbar
        key={toastState.key}
        open={toastState.open}
        autoHideDuration={toastState.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          zIndex: 99999,
          mb: { xs: 2, sm: 3 },
          mr: { xs: 1, sm: 3 },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={toastState.severity}
          variant="filled"
          elevation={6}
          sx={{
            minWidth: 280,
            maxWidth: 480,
            borderRadius: 2.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            '& .MuiAlert-icon': {
              fontSize: '1.3rem',
            },
          }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
