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
  Storefront,
  SwapHoriz,
} from '@mui/icons-material';
import { AuthUser, CurrencyConfig, DEFAULT_CURRENCIES, Partner, UserRole } from '../types';

interface NavbarProps {
  activeRole: UserRole;
  onSwitchRole: (newRole: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  partners: Partner[];
  selectedPartnerId: string;
  onSelectPartner: (id: string) => void;
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (currency: CurrencyConfig) => void;
  onOpenTransactionModal?: () => void;
  onOpenBusinessTxModal?: () => void;
  onOpenPartnerModal: () => void;
  onOpenSettingsModal: () => void;
  isAppwriteEnabled?: boolean;
  onToggleTheme: () => void;
  currentUser: AuthUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onSwitchRole,
  activeTab,
  setActiveTab,
  partners,
  selectedPartnerId,
  onSelectPartner,
  currentCurrency,
  onSelectCurrency,
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

  const isInvestor = activeRole === 'INVESTOR';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
      className="no-print"
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2, md: 3 }, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        
        {/* Brand & Portal Switcher Chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="CapVenture"
            sx={{
              width: { xs: 32, sm: 38 },
              height: { xs: 32, sm: 38 },
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2, color: theme.palette.text.primary, display: { xs: 'none', sm: 'block' } }}>
                CapVenture
              </Typography>

              {/* Portal Mode Chip */}
              <Tooltip title="Click to switch portal role">
                <Chip
                  icon={isInvestor ? <TrendingUp style={{ fontSize: 13 }} /> : <Storefront style={{ fontSize: 13 }} />}
                  label={isInvestor ? 'Investor' : 'Business'}
                  size="small"
                  color={isInvestor ? 'primary' : 'success'}
                  onClick={() => onSwitchRole(isInvestor ? 'BUSINESS_OPERATOR' : 'INVESTOR')}
                  deleteIcon={<SwapHoriz style={{ fontSize: 13 }} />}
                  onDelete={() => onSwitchRole(isInvestor ? 'BUSINESS_OPERATOR' : 'INVESTOR')}
                  sx={{
                    height: { xs: 24, sm: 22 },
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    '& .MuiChip-deleteIcon': {
                      display: { xs: 'none', sm: 'inline-flex' },
                    },
                  }}
                />
              </Tooltip>

              {isAppwriteEnabled ? (
                <Chip
                  icon={<CloudDone style={{ fontSize: 13 }} />}
                  label="Appwrite"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onClick={onOpenSettingsModal}
                  sx={{ height: 22, fontSize: '0.68rem', cursor: 'pointer', display: { xs: 'none', sm: 'inline-flex' } }}
                />
              ) : (
                <Chip
                  icon={<CloudOff style={{ fontSize: 13 }} />}
                  label="Local"
                  size="small"
                  variant="outlined"
                  onClick={onOpenSettingsModal}
                  sx={{ height: 22, fontSize: '0.68rem', cursor: 'pointer', display: { xs: 'none', sm: 'inline-flex' } }}
                />
              )}
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: { xs: 'none', sm: 'block' } }}>
              {isInvestor ? 'Investment & Profit Ledger' : 'Business Operations & Due Ledger'}
            </Typography>
          </Box>
        </Box>

        {/* Center Tabs */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            indicatorColor={isInvestor ? 'primary' : 'secondary'}
            textColor={isInvestor ? 'primary' : 'secondary'}
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
            {isInvestor ? [
              <Tab key="dashboard" icon={<AssessmentOutlined fontSize="small" />} iconPosition="start" label="Dashboard" value="dashboard" />,
              <Tab key="ledger" icon={<TableChartOutlined fontSize="small" />} iconPosition="start" label="Transactions Ledger" value="ledger" />,
              <Tab key="statement" icon={<ReceiptLongOutlined fontSize="small" />} iconPosition="start" label="Statement of Account" value="statement" />,
            ] : [
              <Tab key="business_dashboard" icon={<AssessmentOutlined fontSize="small" />} iconPosition="start" label="Business Overview" value="business_dashboard" />,
              <Tab key="business_ledger" icon={<TableChartOutlined fontSize="small" />} iconPosition="start" label="Sales & Dues" value="business_ledger" />,
              <Tab key="business_customers" icon={<PeopleOutlined fontSize="small" />} iconPosition="start" label="Customers" value="business_customers" />,
            ]}
          </Tabs>
        </Box>

        {/* Right Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.2 }, flexShrink: 0 }}>
          
          {/* Partner Dropdown (Investor Mode only) */}
          {isInvestor && (
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
          )}

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
            <IconButton onClick={onToggleTheme} size="small" sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}>
              {theme.palette.mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Partners Button (Investor Mode) */}
          {isInvestor && (
            <Tooltip title="Manage Partners">
              <IconButton onClick={onOpenPartnerModal} size="small" sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary }, display: { xs: 'none', sm: 'inline-flex' } }}>
                <PeopleOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Settings Button */}
          <Tooltip title="Settings & Sync">
            <IconButton onClick={onOpenSettingsModal} size="small" sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}>
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
                      bgcolor: isInvestor ? 'primary.main' : '#059669',
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
                slotProps={{ paper: { elevation: 4, sx: { mt: 1, minWidth: 230, borderRadius: 2, p: 1 } } }}
              >
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {currentUser.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', display: 'block' }}>
                    {currentUser.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 0.8, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={isInvestor ? 'Investor' : 'Business Operator'}
                      color={isInvestor ? 'primary' : 'success'}
                      sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
                    />
                    <Chip
                      size="small"
                      label="Cloud"
                      color="secondary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.6875rem' }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    onSwitchRole(isInvestor ? 'BUSINESS_OPERATOR' : 'INVESTOR');
                  }}
                >
                  <ListItemIcon>
                    <SwapHoriz fontSize="small" color="primary" />
                  </ListItemIcon>
                  Switch to {isInvestor ? 'Business Portal' : 'Investor Portal'}
                </MenuItem>
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
              sx={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none', px: { xs: 1, sm: 1.8 }, minWidth: 0 }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sign In</Box>
            </Button>
          )}

        </Box>

      </Toolbar>

      {/* Mobile Sub-Navigation Bar */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          indicatorColor={isInvestor ? 'primary' : 'secondary'}
          textColor={isInvestor ? 'primary' : 'secondary'}
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
          {isInvestor ? [
            <Tab key="dashboard" label="Dashboard" value="dashboard" />,
            <Tab key="ledger" label="Ledger" value="ledger" />,
            <Tab key="statement" label="Statement" value="statement" />,
          ] : [
            <Tab key="business_dashboard" label="Overview" value="business_dashboard" />,
            <Tab key="business_ledger" label="Sales & Dues" value="business_ledger" />,
            <Tab key="business_customers" label="Customers" value="business_customers" />,
          ]}
        </Tabs>
      </Box>
    </AppBar>
  );
};
