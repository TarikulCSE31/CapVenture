import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container,
  Tooltip,
  useTheme,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  LockOutlined,
  MailOutlined,
  PersonOutlined,
  Visibility,
  VisibilityOff,
  Login,
  PersonAdd,
  Brightness4,
  Brightness7,
  CloudDone,
  Storefront,
} from '@mui/icons-material';

import { UserRole } from '../types';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onSignup,
  themeMode,
  onToggleTheme,
}) => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0); // 0 = Sign In, 1 = Sign Up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('INVESTOR');
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
      setError('Please provide your email address and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (tabIndex === 1) {
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
        await onSignup(name.trim(), email.trim(), password, selectedRole);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2.5, md: 4 },
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="CapVenture"
            sx={{ width: 36, height: 36, borderRadius: 1.5, flexShrink: 0 }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              CapVenture
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
              Capital &amp; Profit Tracker
            </Typography>
          </Box>
        </Box>

        <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton onClick={onToggleTheme} size="small" color="inherit">
            {themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Centered Login Card */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 3.5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 36px rgba(0, 0, 0, 0.45)'
              : '0 12px 36px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                component="img"
                src="/logo.svg"
                alt="CapVenture"
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  mb: 1.5,
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {tabIndex === 0 ? 'Sign In' : 'Create Account'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {tabIndex === 0
                  ? 'Access your investment portfolios & financial ledger'
                  : 'Start tracking capital advances and profit shares'}
              </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                label="Sign In"
                icon={<Login fontSize="small" />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab
                label="Register"
                icon={<PersonAdd fontSize="small" />}
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Auth Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tabIndex === 1 && (
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  placeholder="e.g. John Doe"
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
                placeholder="name@company.com"
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
                placeholder="••••••••"
                helperText="Minimum 8 characters"
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
                  placeholder="••••••••"
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

              {tabIndex === 1 && (
                <Box sx={{ my: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                    SELECT YOUR ACCOUNT ROLE
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setSelectedRole('INVESTOR')}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedRole === 'INVESTOR' ? 'primary.main' : 'divider',
                        bgcolor: selectedRole === 'INVESTOR'
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(25, 118, 210, 0.15)'
                            : 'rgba(25, 118, 210, 0.06)'
                          : 'transparent',
                        textAlign: 'center',
                        transition: 'all 0.15s ease-in-out',
                      }}
                    >
                      <TrendingUp
                        sx={{
                          fontSize: 26,
                          color: selectedRole === 'INVESTOR' ? 'primary.main' : 'text.secondary',
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 700 }}>
                        Investor
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6875rem' }}>
                        Investments & Profit
                      </Typography>
                    </Paper>

                    <Paper
                      variant="outlined"
                      onClick={() => setSelectedRole('BUSINESS_OPERATOR')}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedRole === 'BUSINESS_OPERATOR' ? 'primary.main' : 'divider',
                        bgcolor: selectedRole === 'BUSINESS_OPERATOR'
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(25, 118, 210, 0.15)'
                            : 'rgba(25, 118, 210, 0.06)'
                          : 'transparent',
                        textAlign: 'center',
                        transition: 'all 0.15s ease-in-out',
                      }}
                    >
                      <Storefront
                        sx={{
                          fontSize: 26,
                          color: selectedRole === 'BUSINESS_OPERATOR' ? 'primary.main' : 'text.secondary',
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 700 }}>
                        Business Operator
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6875rem' }}>
                        Sales, Dues & Customers
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 1.5,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : tabIndex === 0 ? (
                  'Sign In to Dashboard'
                ) : (
                  'Create Free Account'
                )}
              </Button>
            </Box>

            {/* Cloud Badge */}
            <Box
              sx={{
                mt: 3.5,
                pt: 2.5,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <CloudDone sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Protected with Appwrite Cloud Session Authentication
              </Typography>
            </Box>

          </CardContent>
        </Card>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          CapVenture • Business Investment & Profit Tracking System
        </Typography>
      </Box>
    </Box>
  );
};
