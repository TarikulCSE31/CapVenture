import React, { useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Card,
  CardActionArea,
  Avatar,
  Paper,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CallMade,
  CallReceived,
  TrendingUp,
  ArrowForward,
  Schedule,
  Phone,
  Mail,
  ReceiptLong,
} from '@mui/icons-material';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { LedgerTable } from './components/LedgerTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { StatementView } from './components/StatementView';
import { TransactionModal } from './components/TransactionModal';
import { PartnerModal } from './components/PartnerModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import {
  Partner,
  Transaction,
  TransactionType,
  AppSettings,
  AuthUser,
} from './types';
import {
  saveStoredPartners,
  saveStoredTransactions,
  getStoredSettings,
  saveStoredSettings,
  exportToCsv,
  triggerDownload,
} from './utils/storage';
import {
  calculateSummary,
  computeRunningBalances,
  formatCurrency,
} from './utils/calculations';
import {
  isAppwriteConfigured,
  fetchPartnersFromAppwrite,
  fetchTransactionsFromAppwrite,
  savePartnerToAppwrite,
  deletePartnerFromAppwrite,
  saveTransactionToAppwrite,
  deleteTransactionFromAppwrite,
  deleteMultipleTransactionsFromAppwrite,
  getCurrentAppwriteUser,
  loginWithAppwrite,
  signupWithAppwrite,
  logoutAppwrite,
} from './utils/appwrite';
import { getAppTheme } from './theme';

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'statement'>('dashboard');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
    if (loadedSettings.theme) {
      setThemeMode(loadedSettings.theme);
    }

    try {
      if (isAppwriteConfigured(loadedSettings.appwrite)) {
        const user = await getCurrentAppwriteUser(loadedSettings.appwrite);
        if (user) {
          setCurrentUser(user);
          const [remotePartners, remoteTransactions] = await Promise.all([
            fetchPartnersFromAppwrite(loadedSettings.appwrite),
            fetchTransactionsFromAppwrite(loadedSettings.appwrite),
          ]);
          setPartners(remotePartners);
          saveStoredPartners(remotePartners);
          setTransactions(remoteTransactions);
          saveStoredTransactions(remoteTransactions);
        } else {
          setCurrentUser(null);
          setPartners([]);
          setTransactions([]);
        }
      } else {
        // Appwrite not configured
        setCurrentUser(null);
        setPartners([]);
        setTransactions([]);
      }
    } catch (err) {
      console.warn('Session verification error:', err);
      setCurrentUser(null);
      setPartners([]);
      setTransactions([]);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const user = await loginWithAppwrite(settings.appwrite, email, pass);
    setCurrentUser(user);
    // Refresh cloud data upon login
    try {
      const [remotePartners, remoteTransactions] = await Promise.all([
        fetchPartnersFromAppwrite(settings.appwrite),
        fetchTransactionsFromAppwrite(settings.appwrite),
      ]);
      setPartners(remotePartners);
      saveStoredPartners(remotePartners);
      setTransactions(remoteTransactions);
      saveStoredTransactions(remoteTransactions);
    } catch (err) {
      console.warn('Cloud sync error on login:', err);
    }
  };

  const handleSignup = async (name: string, email: string, pass: string) => {
    const user = await signupWithAppwrite(settings.appwrite, name, email, pass);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutAppwrite(settings.appwrite);
    setCurrentUser(null);
    setPartners([]);
    setTransactions([]);
  };

  const toggleTheme = () => {
    const newMode: 'dark' | 'light' = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    const updated: AppSettings = { ...settings, theme: newMode };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const partnersMap = useMemo(() => {
    const map: Record<string, Partner> = {};
    for (const p of partners) {
      map[p.id] = p;
    }
    return map;
  }, [partners]);

  const relevantTransactions = useMemo(() => {
    if (selectedPartnerId === 'ALL') return transactions;
    return transactions.filter((t) => t.partnerId === selectedPartnerId);
  }, [transactions, selectedPartnerId]);

  const summary = useMemo(() => {
    return calculateSummary(relevantTransactions);
  }, [relevantTransactions]);

  const transactionsWithBalance = useMemo(() => {
    return computeRunningBalances(relevantTransactions, partnersMap);
  }, [relevantTransactions, partnersMap]);

  const activePartner = useMemo(() => {
    if (selectedPartnerId === 'ALL') return null;
    return partnersMap[selectedPartnerId] || null;
  }, [selectedPartnerId, partnersMap]);

  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];
    let targetTx: Transaction;

    if (existingId) {
      targetTx = { ...transactions.find((t) => t.id === existingId)!, ...data };
      updated = transactions.map((t) => (t.id === existingId ? targetTx : t));
    } else {
      targetTx = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      updated = [targetTx, ...transactions];
    }

    setTransactions(updated);
    saveStoredTransactions(updated);
    setEditingTx(null);

    if (isAppwriteConfigured(settings.appwrite)) {
      saveTransactionToAppwrite(settings.appwrite, targetTx).catch(console.error);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);

    if (isAppwriteConfigured(settings.appwrite)) {
      deleteTransactionFromAppwrite(settings.appwrite, id).catch(console.error);
    }
  };

  const handleDeleteMultipleTransactions = (ids: string[]) => {
    const updated = transactions.filter((t) => !ids.includes(t.id));
    setTransactions(updated);
    saveStoredTransactions(updated);

    if (isAppwriteConfigured(settings.appwrite)) {
      deleteMultipleTransactionsFromAppwrite(settings.appwrite, ids).catch(console.error);
    }
  };

  const handleOpenAddTxModal = (presetType?: TransactionType) => {
    if (presetType) {
      setEditingTx({
        id: '',
        partnerId: selectedPartnerId !== 'ALL' ? selectedPartnerId : (partners[0]?.id || ''),
        amount: 0,
        type: presetType,
        date: new Date().toISOString().split('T')[0],
        description: '',
        createdAt: '',
      });
    } else {
      setEditingTx(null);
    }
    setIsTxModalOpen(true);
  };

  const handleSavePartner = (
    data: Omit<Partner, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Partner[];
    let targetPartner: Partner;

    if (existingId) {
      targetPartner = { ...partners.find((p) => p.id === existingId)!, ...data };
      updated = partners.map((p) => (p.id === existingId ? targetPartner : p));
    } else {
      targetPartner = {
        ...data,
        id: `partner-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [...partners, targetPartner];
      setSelectedPartnerId(targetPartner.id);
    }

    setPartners(updated);
    saveStoredPartners(updated);

    if (isAppwriteConfigured(settings.appwrite)) {
      savePartnerToAppwrite(settings.appwrite, targetPartner).catch(console.error);
    }
  };

  const handleDeletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveStoredPartners(updated);
    if (selectedPartnerId === id) {
      setSelectedPartnerId('ALL');
    }

    if (isAppwriteConfigured(settings.appwrite)) {
      deletePartnerFromAppwrite(settings.appwrite, id).catch(console.error);
    }
  };

  const handleExportCsv = () => {
    const csv = exportToCsv(relevantTransactions, partners);
    const filename = `ledger-statement-${selectedPartnerId}-${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
  };

  const muiTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  // 1. Session verification loading screen
  if (isCheckingAuth) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.35)',
            }}
          >
            <TrendingUp fontSize="medium" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            CapVenture
          </Typography>
          <CircularProgress size={28} thickness={4} />
          <Typography variant="caption" color="text.secondary">
            Verifying security session...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // 2. Unauthenticated: Only display Auth Page
  if (!currentUser) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthPage
          onLogin={handleLogin}
          onSignup={handleSignup}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
        />
      </ThemeProvider>
    );
  }

  // 3. Authenticated: Full Application Access
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        
        {/* Top Material AppBar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          partners={partners}
          selectedPartnerId={selectedPartnerId}
          onSelectPartner={setSelectedPartnerId}
          currentCurrency={settings.currency}
          onSelectCurrency={(curr) => {
            const updated = { ...settings, currency: curr };
            setSettings(updated);
            saveStoredSettings(updated);
          }}
          onOpenTransactionModal={() => handleOpenAddTxModal()}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          isAppwriteEnabled={Boolean(settings.appwrite?.enabled)}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Viewport Container */}
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Active Partner Banner */}
          {activePartner && (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
              }}
              className="no-print"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: activePartner.avatarColor || 'primary.main',
                    width: 48,
                    height: 48,
                    fontWeight: 700,
                  }}
                >
                  {activePartner.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                      {activePartner.name}
                    </Typography>
                    <Chip label="Filtered View" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                    {activePartner.phone && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone style={{ fontSize: 13 }} /> {activePartner.phone}
                      </Typography>
                    )}
                    {activePartner.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Mail style={{ fontSize: 13 }} /> {activePartner.email}
                      </Typography>
                    )}
                    {activePartner.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Terms: {activePartner.notes}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => setSelectedPartnerId('ALL')}>
                  All Partners
                </Button>
                <Button size="small" variant="contained" onClick={() => setActiveTab('statement')} startIcon={<ReceiptLong />}>
                  Statement
                </Button>
              </Box>
            </Paper>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              
              {/* Material KPI Cards */}
              <KpiCards summary={summary} currency={settings.currency} />

              {/* Quick Action Shortcut Cards */}
              <Grid container spacing={2} className="no-print">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardActionArea onClick={() => handleOpenAddTxModal('INVESTMENT_OUT')} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            <CallMade fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Disburse Capital</Typography>
                            <Typography variant="caption" color="text.secondary">Advance funds to partner</Typography>
                          </Box>
                        </Box>
                        <ArrowForward fontSize="small" color="action" />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardActionArea onClick={() => handleOpenAddTxModal('PRINCIPAL_RETURN')} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 36, height: 36 }}>
                            <CallReceived fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Record Principal Back</Typography>
                            <Typography variant="caption" color="text.secondary">Repay borrowed principal</Typography>
                          </Box>
                        </Box>
                        <ArrowForward fontSize="small" color="action" />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card>
                    <CardActionArea onClick={() => handleOpenAddTxModal('PROFIT_PAYOUT')} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                            <TrendingUp fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Record Profit Share</Typography>
                            <Typography variant="caption" color="text.secondary">Collect earned profit</Typography>
                          </Box>
                        </Box>
                        <ArrowForward fontSize="small" color="action" />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>

              {/* Visual Analytics & Charts */}
              <AnalyticsCharts
                transactions={relevantTransactions}
                summary={summary}
                currency={settings.currency}
              />

              {/* Recent Activity Mini-Feed */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Recent Transactions
                    </Typography>
                  </Box>
                  <Button size="small" onClick={() => setActiveTab('ledger')} endIcon={<ArrowForward />}>
                    View All
                  </Button>
                </Box>

                <List disablePadding>
                  {transactionsWithBalance.slice(0, 5).map((t, idx) => {
                    const isProfit = t.type === 'PROFIT_PAYOUT';
                    const isReturn = t.type === 'PRINCIPAL_RETURN';
                    const isReinvest = t.type === 'REINVEST';

                    return (
                      <React.Fragment key={t.id}>
                        {idx > 0 && <Divider component="li" />}
                        <ListItem
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          secondaryAction={
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  color: isProfit || isReinvest ? 'success.main' : isReturn ? 'warning.main' : 'primary.main',
                                }}
                              >
                                {isProfit ? '+' : ''}
                                {formatCurrency(t.amount, settings.currency)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                Bal: {formatCurrency(t.runningPrincipal, settings.currency)}
                              </Typography>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: isProfit
                                  ? 'success.main'
                                  : isReturn
                                  ? 'warning.main'
                                  : isReinvest
                                  ? 'secondary.main'
                                  : 'primary.main',
                              }}
                            >
                              {isProfit ? <TrendingUp fontSize="small" /> : isReturn ? <CallReceived fontSize="small" /> : <CallMade fontSize="small" />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {t.partnerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  • {t.date}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                                {t.description || 'Transaction entry'}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Paper>

            </Box>
          )}

          {/* LEDGER TAB */}
          {activeTab === 'ledger' && (
            <LedgerTable
              transactionsWithBalance={transactionsWithBalance}
              currency={settings.currency}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
              onExportCsv={handleExportCsv}
              onOpenAddModal={() => handleOpenAddTxModal()}
              partners={partners}
            />
          )}

          {/* STATEMENT TAB */}
          {activeTab === 'statement' && (
            <StatementView
              partner={activePartner}
              allPartners={partners}
              onSelectPartner={setSelectedPartnerId}
              transactionsWithBalance={transactionsWithBalance}
              summary={summary}
              currency={settings.currency}
            />
          )}

        </Container>

        {/* Modals */}
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => {
            setIsTxModalOpen(false);
            setEditingTx(null);
          }}
          onSave={handleSaveTransaction}
          partners={partners}
          editingTransaction={editingTx}
          currency={settings.currency}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        />

        <PartnerModal
          isOpen={isPartnerModalOpen}
          onClose={() => setIsPartnerModalOpen(false)}
          partners={partners}
          onSavePartner={handleSavePartner}
          onDeletePartner={handleDeletePartner}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          onDataReloaded={loadAllData}
          onExportCsv={handleExportCsv}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onContinueAsGuest={() => setIsAuthModalOpen(false)}
        />

        {/* Material Footer */}
        <Box
          component="footer"
          sx={{
            py: 2.5,
            textAlign: 'center',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mt: 'auto',
          }}
          className="no-print"
        >
          <Typography variant="caption" color="text.secondary">
            CapVenture • Material UI Business Investment & Profit Tracker • 100% Free & Open
          </Typography>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
