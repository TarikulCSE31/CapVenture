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
  ListItemText,
  Switch,
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
  PaidOutlined,
  ChevronRight,
  Check,
  GroupOutlined,
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
  onOpenTeamModal: () => void;
  companyName?: string;
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
  onOpenTeamModal,
  companyName,
  isAppwriteEnabled = false,
  onToggleTheme,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElSettings, setAnchorElSettings] = React.useState<null | HTMLElement>(null);
  const [anchorElCurrency, setAnchorElCurrency] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleCloseSettingsMenu = () => {
    setAnchorElSettings(null);
    setAnchorElCurrency(null);
  };

  const handleOpenCurrencyMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCurrency(event.currentTarget);
  };

  const handleCloseCurrencyMenu = () => {
    setAnchorElCurrency(null);
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
                onChange={(e) => {
                  if (e.target.value === '__MANAGE_PARTNERS__') {
                    onOpenPartnerModal();
                  } else {
                    onSelectPartner(e.target.value);
                  }
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                <MenuItem value="ALL">All Partners ({partners.length})</MenuItem>
                {partners.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  value="__MANAGE_PARTNERS__"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <PeopleOutlined fontSize="small" /> Manage Partners...
                </MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Settings Button */}
          <Tooltip title="Settings & Preferences">
            <IconButton
              onClick={handleOpenSettingsMenu}
              size="small"
              sx={{
                color: Boolean(anchorElSettings) ? 'primary.main' : theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary },
              }}
            >
              <SettingsOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Settings Menu Dropdown */}
          <Menu
            anchorEl={anchorElSettings}
            open={Boolean(anchorElSettings)}
            onClose={handleCloseSettingsMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                elevation: 6,
                sx: {
                  mt: 1,
                  minWidth: 260,
                  borderRadius: 2.5,
                  p: 0.75,
                },
              },
            }}
          >
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.75, color: 'text.secondary', fontSize: '0.7rem' }}>
                Preferences
              </Typography>
            </Box>

            {/* 1. Theme Toggle */}
            <MenuItem
              onClick={() => {
                onToggleTheme();
              }}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.mode === 'dark' ? 'warning.light' : 'primary.main' }}>
                {theme.palette.mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                sx={{ my: 0, flex: 1 }}
                primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Theme Mode</Typography>}
                secondary={<Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>{theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</Typography>}
              />
              <Switch
                size="small"
                checked={theme.palette.mode === 'dark'}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleTheme();
                }}
                sx={{ mr: -0.5 }}
              />
            </MenuItem>

            {/* 2. Currency Selector Item */}
            <MenuItem
              onClick={handleOpenCurrencyMenu}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'success.main' }}>
                <PaidOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText
                sx={{ my: 0, flex: 1 }}
                primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Currency</Typography>}
                secondary={<Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>{currentCurrency.label.split('(')[0].trim()}</Typography>}
              />
              <Chip
                size="small"
                label={`${currentCurrency.symbol} ${currentCurrency.code}`}
                color="primary"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.725rem', fontWeight: 700, mr: 0.5 }}
              />
              <ChevronRight fontSize="small" sx={{ color: 'text.secondary', ml: -0.5 }} />
            </MenuItem>

            {/* 3. Manage Partners (Investor Mode) */}
            {isInvestor && (
              <MenuItem
                onClick={() => {
                  handleCloseSettingsMenu();
                  onOpenPartnerModal();
                }}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <PeopleOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  sx={{ my: 0, flex: 1 }}
                  primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Manage Partners</Typography>}
                  secondary={<Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>{`${partners.length} active partner${partners.length === 1 ? '' : 's'}`}</Typography>}
                />
              </MenuItem>
            )}

            {/* Team & Organization */}
            <MenuItem
              onClick={() => {
                handleCloseSettingsMenu();
                onOpenTeamModal();
              }}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'info.main' }}>
                <GroupOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText
                sx={{ my: 0, flex: 1 }}
                primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Team & Organization</Typography>}
                secondary={<Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>Invite members & collaborate</Typography>}
              />
            </MenuItem>

            <Divider sx={{ my: 0.8, mx: 1 }} />

            {/* 4. Full Settings Modal */}
            <MenuItem
              onClick={() => {
                handleCloseSettingsMenu();
                onOpenSettingsModal();
              }}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                <SettingsOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText
                sx={{ my: 0, flex: 1 }}
                primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>All Settings & Sync</Typography>}
                secondary={<Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>Cloud, Data Backup, Hosting</Typography>}
              />
            </MenuItem>
          </Menu>

          {/* Currency Submenu */}
          <Menu
            anchorEl={anchorElCurrency}
            open={Boolean(anchorElCurrency)}
            onClose={handleCloseCurrencyMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                elevation: 6,
                sx: {
                  minWidth: 220,
                  maxHeight: 340,
                  borderRadius: 2.5,
                  p: 0.75,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '0.7rem' }}>
                Select Currency
              </Typography>
            </Box>
            {DEFAULT_CURRENCIES.map((c) => {
              const isSelected = currentCurrency.code === c.code;
              return (
                <MenuItem
                  key={c.code}
                  selected={isSelected}
                  onClick={() => {
                    onSelectCurrency(c);
                    handleCloseCurrencyMenu();
                    handleCloseSettingsMenu();
                  }}
                  sx={{
                    py: 0.8,
                    px: 2,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'primary.main' : 'text.primary', minWidth: 26 }}>
                      {c.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: '0.825rem', fontWeight: isSelected ? 600 : 400 }}>
                      {c.code} - {c.label.split('(')[0].trim()}
                    </Typography>
                  </Box>
                  {isSelected && <Check fontSize="small" color="primary" sx={{ fontSize: '1.1rem', ml: 1 }} />}
                </MenuItem>
              );
            })}
          </Menu>

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
                  {companyName && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 600, mt: 0.3 }}>
                      {companyName}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 0.8, mt: 0.8, alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={isInvestor ? 'Investor' : 'Business Operator'}
                      color={isInvestor ? 'primary' : 'success'}
                      sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
                    />
                    <Chip
                      size="small"
                      label={currentUser.companyRole || 'Owner'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.6875rem' }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    onOpenTeamModal();
                  }}
                >
                  <ListItemIcon>
                    <GroupOutlined fontSize="small" color="primary" />
                  </ListItemIcon>
                  Team &amp; Organization
                </MenuItem>
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
                  Settings &amp; Sync
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
