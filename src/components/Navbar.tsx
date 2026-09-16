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
} from '@mui/icons-material';
import { CurrencyConfig, DEFAULT_CURRENCIES, Partner } from '../types';

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
}) => {
  const theme = useTheme();

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
