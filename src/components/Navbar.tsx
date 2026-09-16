import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  useTheme,
  Avatar,
  Menu,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Add,
  PeopleOutlined,
  SettingsOutlined,
  TableChartOutlined,
  AssessmentOutlined,
  ReceiptLongOutlined,
  Brightness4,
  Brightness7,
  CloudDone,
  CloudOff,
  Login,
  Logout,
} from '@mui/icons-material';
import { AuthUser, CurrencyConfig, DEFAULT_CURRENCIES, Partner } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'ledger' | 'statement';
  setActiveTab: (tab: 'dashboard' | 'ledger' | 'statement') => void;
  partners: Partner[];
  selectedPartnerId: string;
  onSelectPartner: (id: string) => void;
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (currency: CurrencyConfig) => void;
  onOpenTransactionModal: () => void;
  onOpenPartnerModal: () => void;
  onOpenSettingsModal: () => void;
  isAppwriteEnabled?: boolean;
  onToggleTheme: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  partners,
  selectedPartnerId,
  onSelectPartner,
  currentCurrency,
  onSelectCurrency,
  onOpenTransactionModal,
  onOpenPartnerModal,
  onOpenSettingsModal,
  isAppwriteEnabled = false,
  onToggleTheme,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
      className="no-print"
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Brand & Cloud Badge */}
        <Box sx={{ display: 'flex', items: 'center', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              color: '#ffffff',
            }}
          >
            <TrendingUp fontSize="small" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>
                CapVenture
              </Typography>
              {isAppwriteEnabled ? (
                <Chip
                  icon={<CloudDone style={{ fontSize: 14 }} />}
                  label="Appwrite"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onClick={onOpenSettingsModal}
                  sx={{ height: 22, fontSize: '0.7rem', cursor: 'pointer' }}
                />
              ) : (
                <Chip
                  icon={<CloudOff style={{ fontSize: 14 }} />}
                  label="Local"
                  size="small"
                  variant="outlined"
                  onClick={onOpenSettingsModal}
                  sx={{ height: 22, fontSize: '0.7rem', cursor: 'pointer' }}
                />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Investment & Profit Ledger
            </Typography>
          </Box>
        </Box>

        {/* Center Tabs */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.85rem',
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab icon={<AssessmentOutlined fontSize="small" />} iconPosition="start" label="Dashboard" value="dashboard" />
            <Tab icon={<TableChartOutlined fontSize="small" />} iconPosition="start" label="Transactions Ledger" value="ledger" />
            <Tab icon={<ReceiptLongOutlined fontSize="small" />} iconPosition="start" label="Statement of Account" value="statement" />
          </Tabs>
        </Box>

        {/* Right Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          {/* Partner Dropdown */}
          <FormControl size="small" sx={{ minWidth: 140, display: { xs: 'none', sm: 'block' } }}>
            <Select
              value={selectedPartnerId}
              onChange={(e) => onSelectPartner(e.target.value)}
              sx={{ fontSize: '0.8125rem' }}
            >
              <MenuItem value="ALL">All Partners ({partners.length})</MenuItem>
              {partners.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Currency Dropdown */}
          <FormControl size="small" sx={{ width: 95, display: { xs: 'none', lg: 'block' } }}>
            <Select
              value={currentCurrency.code}
              onChange={(e) => {
                const found = DEFAULT_CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onSelectCurrency(found);
              }}
              sx={{ fontSize: '0.8125rem' }}
            >
              {DEFAULT_CURRENCIES.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Theme Toggle Button */}
          <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={onToggleTheme} size="small" color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Partners Button */}
          <Tooltip title="Manage Partners">
            <IconButton onClick={onOpenPartnerModal} size="small" color="inherit">
              <PeopleOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Settings Button */}
          <Tooltip title="Settings & Sync">
            <IconButton onClick={onOpenSettingsModal} size="small" color="inherit">
              <SettingsOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* User Account / Sign In */}
          {currentUser ? (
            <>
              <Tooltip title={`Signed in as ${currentUser.name || currentUser.email}`}>
                <IconButton onClick={handleOpenUserMenu} size="small" sx={{ p: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { elevation: 4, sx: { mt: 1, minWidth: 220, borderRadius: 2, p: 1 } } }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {currentUser.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', display: 'block' }}>
                    {currentUser.email}
                  </Typography>
                  <Chip
                    size="small"
                    label="Appwrite Cloud"
                    color="success"
                    variant="outlined"
                    sx={{ mt: 0.8, height: 20, fontSize: '0.6875rem' }}
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => { handleCloseUserMenu(); onOpenSettingsModal(); }}>
                  <ListItemIcon>
                    <SettingsOutlined fontSize="small" />
                  </ListItemIcon>
                  Settings & Sync
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); onLogout(); }}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <Typography color="error" variant="inherit">
                    Sign Out
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Login fontSize="small" />}
              onClick={onOpenAuthModal}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none' }}
            >
              Sign In
            </Button>
          )}

          {/* Record Entry Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onOpenTransactionModal}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.8125rem', px: 1.8 }}
          >
            Record Entry
          </Button>

        </Box>

      </Toolbar>

      {/* Mobile Sub-Navigation Bar */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            minHeight: 42,
            width: '100%',
            '& .MuiTab-root': {
              minHeight: 42,
              fontSize: '0.75rem',
              py: 0.5,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Dashboard" value="dashboard" />
          <Tab label="Ledger" value="ledger" />
          <Tab label="Statement" value="statement" />
        </Tabs>
      </Box>
    </AppBar>
  );
};
