import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close,
  LockOutlined,
  MailOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
  Login,
  PersonAdd,
} from '@mui/icons-material';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onContinueAsGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  onContinueAsGuest,
}) => {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide your email and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (tabIndex === 1) {
      // Sign Up
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);
    try {
      if (tabIndex === 0) {
        await onLogin(email.trim(), password);
      } else {
        await onSignup(name.trim(), email.trim(), password);
      }
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          elevation: 4,
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlined fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {tabIndex === 0 ? 'Welcome Back' : 'Create Account'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              CapVenture Capital & Profit Tracker
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={loading}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sign In" icon={<Login fontSize="small" />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Register" icon={<PersonAdd fontSize="small" />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabIndex === 1 && (
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="e.g. Alex Morgan"
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            placeholder="you@example.com"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            placeholder="At least 8 characters"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {tabIndex === 1 && (
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="Re-enter password"
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1, py: 1.2, fontWeight: 700 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : tabIndex === 0 ? (
              'Sign In with Appwrite'
            ) : (
              'Create Free Account'
            )}
          </Button>

          <Box sx={{ position: 'relative', my: 1 }}>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
            </Divider>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="small"
            onClick={onContinueAsGuest}
            disabled={loading}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Continue as Guest (Local Offline Mode)
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
