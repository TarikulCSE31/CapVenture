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
import { TeamModal } from './components/TeamModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { CustomersTable } from './components/business/CustomersTable';
import { BusinessLedgerTable } from './components/business/BusinessLedgerTable';
import { CustomerModal } from './components/business/CustomerModal';
import { BusinessTransactionModal } from './components/business/BusinessTransactionModal';
import {
  Partner,
  Transaction,
  TransactionType,
  AppSettings,
  AuthUser,
  CurrencyConfig,
  DEFAULT_CURRENCIES,
  UserRole,
  BusinessCustomer,
  BusinessTransaction,
  BusinessTransactionType,
  CustomerWithBalance,
  BusinessSummary,
  CompanyProfile,
  CompanyInvitation,
  CompanyRole,
} from './types';
import {
  getStoredPartners,
  saveStoredPartners,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredSettings,
  saveStoredSettings,
  exportToCsv,
  triggerDownload,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredBusinessTransactions,
  saveStoredBusinessTransactions,
} from './utils/storage';
import {
  getOrCreateUserCompany,
  getStoredCompany,
  saveStoredCompany,
  createInvitation,
  getAllStoredInvitations,
  saveAllStoredInvitations,
  findInvitationByToken,
  findPendingInvitationForEmail,
  acceptInvitation,
  revokeInvitation,
  confirmMemberJoin,
  removeMemberFromCompany,
} from './utils/company';
import {
  calculateSummary,
  computeRunningBalances,
  formatCurrency,
} from './utils/calculations';
import {
  calculateBusinessSummary,
  computeCustomerBalances,
} from './utils/businessCalculations';
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
  fetchUserPreferences,
  saveUserPreferences,
  saveCompanyToAppwrite,
  fetchCompanyFromAppwrite,
  findPendingInvitationInAppwrite,
} from './utils/appwrite';
import { getAppTheme } from './theme';
import { ToastProvider, useToast } from './context/ToastContext';

function AppContent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());

  // Role and Navigation
  const [activeRole, setActiveRole] = useState<UserRole>('INVESTOR');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Business Operator Data
  const [businessCustomers, setBusinessCustomers] = useState<BusinessCustomer[]>([]);
  const [businessTransactions, setBusinessTransactions] = useState<BusinessTransaction[]>([]);

  // Company and Team Collaboration
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [activeInvitationForAuth, setActiveInvitationForAuth] = useState<CompanyInvitation | null>(null);

  // Modals - Investor
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Modals - Business Operator
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<BusinessCustomer | null>(null);
  const [isBusinessTxModalOpen, setIsBusinessTxModalOpen] = useState(false);
  const [editingBusinessTx, setEditingBusinessTx] = useState<BusinessTransaction | null>(null);
  const [businessTxInitialType, setBusinessTxInitialType] = useState<BusinessTransactionType>('SALE');
  const [businessTxInitialCustomerId, setBusinessTxInitialCustomerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadAllData();
    // Check invite token in URL (e.g. ?invite=token)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');
      if (inviteToken) {
        const found = findInvitationByToken(inviteToken);
        if (found) {
          setActiveInvitationForAuth(found);
          setIsAuthModalOpen(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = themeMode;
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const loadAllData = async () => {
    let loadedSettings = getStoredSettings();
    setSettings(loadedSettings);
    if (loadedSettings.theme) {
      setThemeMode(loadedSettings.theme);
    }

    try {
      if (isAppwriteConfigured(loadedSettings.appwrite)) {
        const user = await getCurrentAppwriteUser(loadedSettings.appwrite);
        if (user) {
          let userCompany = getOrCreateUserCompany(user);
          let allInvites = getAllStoredInvitations();

          // Sync company & invitations from Appwrite cloud if available
          try {
            const cloudData = await fetchCompanyFromAppwrite(loadedSettings.appwrite, userCompany.id);
            if (cloudData) {
              userCompany = {
                ...userCompany,
                ...cloudData.company,
                members: cloudData.company.members || userCompany.members,
              };
              saveStoredCompany(userCompany);
              
              const merged = [...allInvites];
              for (const cInv of cloudData.invitations) {
                const idx = merged.findIndex((i) => i.id === cInv.id);
                if (idx >= 0) {
                  merged[idx] = cInv;
                } else {
                  merged.push(cInv);
                }
              }
              saveAllStoredInvitations(merged);
              allInvites = merged;
            }
          } catch (cloudErr) {
            console.warn('Cloud company sync:', cloudErr);
          }

          user.companyId = userCompany.id;
          user.companyName = userCompany.name;
          user.companyRole =
            userCompany.members.find(
              (m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase()
            )?.companyRole || 'OWNER';

          setCurrentUser(user);
          setCompany(userCompany);
          setInvitations(allInvites);

          const effectiveWorkspaceId = userCompany.id;

          // Sync user-specific settings (Theme, Currency, Role)
          let userSettings = getStoredSettings(user.id);
          let remotePrefs: any = null;
          try {
            remotePrefs = await fetchUserPreferences(loadedSettings.appwrite);
            if (remotePrefs) {
              const appliedTheme = remotePrefs.theme || userSettings.theme || 'dark';
              const appliedCurrCode = remotePrefs.currencyCode || userSettings.currency?.code || 'BDT';
              const appliedCurrency =
                DEFAULT_CURRENCIES.find((c) => c.code === appliedCurrCode) || DEFAULT_CURRENCIES[0];
              const appliedRole = remotePrefs.role || user.role || userSettings.activeRole || 'INVESTOR';

              userSettings = {
                ...userSettings,
                theme: appliedTheme,
                currency: appliedCurrency,
                activeRole: appliedRole,
              };
              setThemeMode(appliedTheme);
              setActiveRole(appliedRole);
              if (appliedRole === 'BUSINESS_OPERATOR') {
                setActiveTab('business_dashboard');
              }
            }
          } catch (prefErr) {
            console.warn('Failed to fetch remote preferences:', prefErr);
          }

          setSettings(userSettings);
          saveStoredSettings(userSettings, user.id);

          // Load Investor data (scoped to company)
          const [remotePartners, remoteTransactions] = await Promise.all([
            fetchPartnersFromAppwrite(loadedSettings.appwrite),
            fetchTransactionsFromAppwrite(loadedSettings.appwrite),
          ]);
          if (remotePartners.length > 0) {
            setPartners(remotePartners);
            saveStoredPartners(remotePartners, effectiveWorkspaceId);
          } else {
            setPartners(getStoredPartners(effectiveWorkspaceId));
          }
          if (remoteTransactions.length > 0) {
            setTransactions(remoteTransactions);
            saveStoredTransactions(remoteTransactions, effectiveWorkspaceId);
          } else {
            setTransactions(getStoredTransactions(effectiveWorkspaceId));
          }

          // Load Business data (scoped to company)
          const storedCust = getStoredCustomers(effectiveWorkspaceId);
          setBusinessCustomers(storedCust);
          const storedBizTx = getStoredBusinessTransactions(effectiveWorkspaceId);
          setBusinessTransactions(storedBizTx);
        } else {
          setCurrentUser(null);
          setCompany(null);
          setPartners(getStoredPartners());
          setTransactions(getStoredTransactions());
          setBusinessCustomers(getStoredCustomers());
          setBusinessTransactions(getStoredBusinessTransactions());
          setInvitations(getAllStoredInvitations());
        }
      } else {
        // Local only
        setCurrentUser(null);
        setCompany(null);
        setPartners(getStoredPartners());
        setTransactions(getStoredTransactions());
        setBusinessCustomers(getStoredCustomers());
        setBusinessTransactions(getStoredBusinessTransactions());
        setInvitations(getAllStoredInvitations());
      }
    } catch (err) {
      console.warn('Session verification error:', err);
      setCurrentUser(null);
      setCompany(null);
      setPartners(getStoredPartners());
      setTransactions(getStoredTransactions());
      setBusinessCustomers(getStoredCustomers());
      setBusinessTransactions(getStoredBusinessTransactions());
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const user = await loginWithAppwrite(settings.appwrite, email, pass);

    // Check for pending invitation by email or active URL invite
    let pendingInvite = activeInvitationForAuth || findPendingInvitationForEmail(email);

    // If not in local storage, query Appwrite cloud
    if (!pendingInvite && isAppwriteConfigured(settings.appwrite)) {
      try {
        const cloudInviteData = await findPendingInvitationInAppwrite(settings.appwrite, email);
        if (cloudInviteData) {
          saveStoredCompany(cloudInviteData.company);
          const allInv = getAllStoredInvitations();
          allInv.push(cloudInviteData.invitation);
          saveAllStoredInvitations(allInv);
          pendingInvite = cloudInviteData.invitation;
        }
      } catch (e) {
        console.warn('Could not check cloud invites on login:', e);
      }
    }

    if (pendingInvite) {
      const acceptRes = acceptInvitation(pendingInvite.id, user);
      if (acceptRes.success && acceptRes.company) {
        user.companyId = acceptRes.company.id;
        user.companyName = acceptRes.company.name;
        user.companyRole = pendingInvite.companyRole;
        user.role = pendingInvite.targetRole;
        setCompany(acceptRes.company);
        if (isAppwriteConfigured(settings.appwrite)) {
          saveCompanyToAppwrite(settings.appwrite, acceptRes.company, getAllStoredInvitations()).catch(console.error);
        }
        showSuccess(`Joined ${acceptRes.company.name} with shared access!`);
      }
      setActiveInvitationForAuth(null);
    } else {
      const userCompany = getOrCreateUserCompany(user);
      user.companyId = userCompany.id;
      user.companyName = userCompany.name;
      user.companyRole =
        userCompany.members.find(
          (m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase()
        )?.companyRole || 'OWNER';
      setCompany(userCompany);
    }

    setCurrentUser(user);
    setInvitations(getAllStoredInvitations());
    showSuccess(`Welcome back, ${user.name || user.email}!`);

    // Fetch user preferences upon login
    let userSettings = getStoredSettings(user.id);
    let appliedRole: UserRole = user.role || userSettings.activeRole || 'INVESTOR';
    try {
      const remotePrefs = await fetchUserPreferences(settings.appwrite);
      if (remotePrefs) {
        const appliedTheme = remotePrefs.theme || userSettings.theme || 'dark';
        const appliedCurrCode = remotePrefs.currencyCode || userSettings.currency?.code || 'BDT';
        const appliedCurrency =
          DEFAULT_CURRENCIES.find((c) => c.code === appliedCurrCode) || DEFAULT_CURRENCIES[0];
        appliedRole = remotePrefs.role || user.role || userSettings.activeRole || 'INVESTOR';

        userSettings = {
          ...userSettings,
          theme: appliedTheme,
          currency: appliedCurrency,
          activeRole: appliedRole,
        };
        setThemeMode(appliedTheme);
      }
    } catch (prefErr) {
      console.warn('Failed to load user preferences on login:', prefErr);
    }
    setActiveRole(appliedRole);
    if (appliedRole === 'BUSINESS_OPERATOR') {
      setActiveTab('business_dashboard');
    } else {
      setActiveTab('dashboard');
    }
    setSettings(userSettings);
    saveStoredSettings(userSettings, user.id);

    // Refresh cloud & business data upon login (scoped to company)
    const effectiveWorkspaceId = user.companyId || user.id;
    try {
      if (isAppwriteConfigured(settings.appwrite)) {
        const [remotePartners, remoteTransactions] = await Promise.all([
          fetchPartnersFromAppwrite(settings.appwrite),
          fetchTransactionsFromAppwrite(settings.appwrite),
        ]);
        if (remotePartners.length > 0) {
          setPartners(remotePartners);
          saveStoredPartners(remotePartners, effectiveWorkspaceId);
        } else {
          setPartners(getStoredPartners(effectiveWorkspaceId));
        }
        if (remoteTransactions.length > 0) {
          setTransactions(remoteTransactions);
          saveStoredTransactions(remoteTransactions, effectiveWorkspaceId);
        } else {
          setTransactions(getStoredTransactions(effectiveWorkspaceId));
        }
      } else {
        setPartners(getStoredPartners(effectiveWorkspaceId));
        setTransactions(getStoredTransactions(effectiveWorkspaceId));
      }
    } catch (err) {
      console.warn('Cloud sync error on login:', err);
      setPartners(getStoredPartners(effectiveWorkspaceId));
      setTransactions(getStoredTransactions(effectiveWorkspaceId));
    }

    const storedCust = getStoredCustomers(effectiveWorkspaceId);
    setBusinessCustomers(storedCust);
    const storedBizTx = getStoredBusinessTransactions(effectiveWorkspaceId);
    setBusinessTransactions(storedBizTx);
    setIsAuthModalOpen(false);
  };

  const handleSignup = async (name: string, email: string, pass: string, role: UserRole = 'INVESTOR') => {
    const user = await signupWithAppwrite(settings.appwrite, name, email, pass, role);

    // Check for pending invitation by URL token or matching email
    let pendingInvite = activeInvitationForAuth || findPendingInvitationForEmail(email);

    // If not in local storage, query Appwrite cloud
    if (!pendingInvite && isAppwriteConfigured(settings.appwrite)) {
      try {
        const cloudInviteData = await findPendingInvitationInAppwrite(settings.appwrite, email);
        if (cloudInviteData) {
          saveStoredCompany(cloudInviteData.company);
          const allInv = getAllStoredInvitations();
          allInv.push(cloudInviteData.invitation);
          saveAllStoredInvitations(allInv);
          pendingInvite = cloudInviteData.invitation;
        }
      } catch (e) {
        console.warn('Could not check cloud invites on signup:', e);
      }
    }

    let effectiveRole = role;

    if (pendingInvite) {
      const acceptRes = acceptInvitation(pendingInvite.id, user);
      if (acceptRes.success && acceptRes.company) {
        user.companyId = acceptRes.company.id;
        user.companyName = acceptRes.company.name;
        user.companyRole = pendingInvite.companyRole;
        effectiveRole = pendingInvite.targetRole;
        user.role = effectiveRole;
        setCompany(acceptRes.company);
        if (isAppwriteConfigured(settings.appwrite)) {
          saveCompanyToAppwrite(settings.appwrite, acceptRes.company, getAllStoredInvitations()).catch(console.error);
        }
        showSuccess(`Welcome to ${acceptRes.company.name}! You now have shared access.`);
      }
      setActiveInvitationForAuth(null);
    } else {
      const userCompany = getOrCreateUserCompany(user);
      user.companyId = userCompany.id;
      user.companyName = userCompany.name;
      user.companyRole = 'OWNER';
      setCompany(userCompany);
      showSuccess('Account created! Welcome to CapVenture.');
    }

    setCurrentUser(user);
    setActiveRole(effectiveRole);
    if (effectiveRole === 'BUSINESS_OPERATOR') {
      setActiveTab('business_dashboard');
    } else {
      setActiveTab('dashboard');
    }

    const updatedSettings: AppSettings = {
      ...settings,
      activeRole: effectiveRole,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings, user.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      saveUserPreferences(settings.appwrite, {
        theme: themeMode,
        currencyCode: settings.currency.code,
        role: effectiveRole,
        companyId: user.companyId,
        companyName: user.companyName,
        companyRole: user.companyRole,
      }).catch(console.error);
    }

    setInvitations(getAllStoredInvitations());

    // Load company workspace data
    const effectiveWorkspaceId = user.companyId || user.id;
    setPartners(getStoredPartners(effectiveWorkspaceId));
    setTransactions(getStoredTransactions(effectiveWorkspaceId));
    setBusinessCustomers(getStoredCustomers(effectiveWorkspaceId));
    setBusinessTransactions(getStoredBusinessTransactions(effectiveWorkspaceId));
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await logoutAppwrite(settings.appwrite);
    setCurrentUser(null);
    setCompany(null);
    setPartners(getStoredPartners());
    setTransactions(getStoredTransactions());
    setBusinessCustomers(getStoredCustomers());
    setBusinessTransactions(getStoredBusinessTransactions());
    const defaultSettings = getStoredSettings();
    setSettings(defaultSettings);
    setThemeMode(defaultSettings.theme || 'dark');
    setActiveRole('INVESTOR');
    setActiveTab('dashboard');
    showSuccess('Signed out successfully.');
  };

  const handleSendInvite = async (
    inviteEmail: string,
    targetRole: UserRole,
    companyRole: CompanyRole
  ): Promise<{ success: boolean; invite?: CompanyInvitation; error?: string }> => {
    if (!company || !currentUser) {
      return { success: false, error: 'Please sign in to invite team members.' };
    }
    try {
      const invite = createInvitation(company, currentUser, inviteEmail, targetRole, companyRole);
      const updatedAll = getAllStoredInvitations();
      setInvitations(updatedAll);
      if (isAppwriteConfigured(settings.appwrite)) {
        saveCompanyToAppwrite(settings.appwrite, company, updatedAll).catch(console.error);
      }
      showSuccess(`Invitation generated for ${inviteEmail}!`);
      return { success: true, invite };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create invitation.' };
    }
  };

  const handleRevokeInvite = (inviteId: string) => {
    revokeInvitation(inviteId);
    const updatedAll = getAllStoredInvitations();
    setInvitations(updatedAll);
    if (company && isAppwriteConfigured(settings.appwrite)) {
      saveCompanyToAppwrite(settings.appwrite, company, updatedAll).catch(console.error);
    }
    showInfo('Invitation revoked.');
  };

  const handleConfirmMember = async (inviteId: string) => {
    if (!company) return;
    const res = confirmMemberJoin(company.id, inviteId);
    if (res.success && res.company) {
      setCompany(res.company);
      const updatedInv = getAllStoredInvitations();
      setInvitations(updatedInv);
      if (isAppwriteConfigured(settings.appwrite)) {
        await saveCompanyToAppwrite(settings.appwrite, res.company, updatedInv);
      }
      showSuccess('Member confirmed and added to active organization!');
    } else {
      showError(res.error || 'Failed to confirm member.');
    }
  };

  const handleRefreshTeamSync = async () => {
    if (!company) return;
    if (isAppwriteConfigured(settings.appwrite)) {
      try {
        const cloudData = await fetchCompanyFromAppwrite(settings.appwrite, company.id);
        if (cloudData) {
          saveStoredCompany(cloudData.company);
          setCompany(cloudData.company);
          saveAllStoredInvitations(cloudData.invitations);
          setInvitations(cloudData.invitations);
          showSuccess('Team status refreshed from cloud.');
          return;
        }
      } catch (e) {
        console.warn('Refresh team sync error:', e);
      }
    }
    const local = getStoredCompany(company.id);
    if (local) setCompany(local);
    setInvitations(getAllStoredInvitations());
    showInfo('Team status up to date.');
  };

  const handleRemoveMember = async (memberUserIdOrEmail: string) => {
    if (!company || !currentUser) return;
    const res = removeMemberFromCompany(company.id, memberUserIdOrEmail, currentUser.id);
    if (res.success && res.company) {
      setCompany(res.company);
      const updatedInv = getAllStoredInvitations();
      setInvitations(updatedInv);
      if (isAppwriteConfigured(settings.appwrite)) {
        await saveCompanyToAppwrite(settings.appwrite, res.company, updatedInv);
      }
      showSuccess('Member removed from organization.');
    } else {
      showError(res.error || 'Failed to remove member.');
    }
  };

  const handleUpdateCompany = (updatedCompany: CompanyProfile) => {
    saveStoredCompany(updatedCompany);
    setCompany(updatedCompany);
    if (isAppwriteConfigured(settings.appwrite)) {
      saveCompanyToAppwrite(settings.appwrite, updatedCompany, getAllStoredInvitations()).catch(console.error);
    }
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        companyName: updatedCompany.name,
      };
      setCurrentUser(updatedUser);
      if (isAppwriteConfigured(settings.appwrite)) {
        saveUserPreferences(settings.appwrite, { companyName: updatedCompany.name }).catch(console.error);
      }
    }
    showSuccess('Company profile updated.');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (newRole === 'INVESTOR') {
      if (activeTab.startsWith('business_')) {
        setActiveTab('dashboard');
      }
    } else {
      if (['dashboard', 'ledger', 'statement'].includes(activeTab)) {
        setActiveTab('business_dashboard');
      }
    }

    const updated: AppSettings = { ...settings, activeRole: newRole };
    setSettings(updated);
    saveStoredSettings(updated, currentUser?.id);

    if (currentUser && isAppwriteConfigured(settings.appwrite)) {
      saveUserPreferences(settings.appwrite, {
        role: newRole,
        theme: themeMode,
        currencyCode: settings.currency.code,
      }).catch(console.error);
    }
    showInfo(newRole === 'INVESTOR' ? 'Switched to Investor Portal.' : 'Switched to Business Operator Portal.');
  };

  const toggleTheme = () => {
    const newMode: 'dark' | 'light' = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    const updated: AppSettings = { ...settings, theme: newMode };
    setSettings(updated);
    saveStoredSettings(updated, currentUser?.id);

    if (currentUser && isAppwriteConfigured(settings.appwrite)) {
      saveUserPreferences(settings.appwrite, {
        theme: newMode,
        currencyCode: settings.currency.code,
        role: activeRole,
      }).catch(console.error);
    }
  };

  const handleSelectCurrency = (curr: CurrencyConfig) => {
    const updated: AppSettings = { ...settings, currency: curr };
    setSettings(updated);
    saveStoredSettings(updated, currentUser?.id);

    if (currentUser && isAppwriteConfigured(settings.appwrite)) {
      saveUserPreferences(settings.appwrite, {
        theme: themeMode,
        currencyCode: curr.code,
        role: activeRole,
      }).catch(console.error);
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.theme) {
      setThemeMode(newSettings.theme);
    }
    saveStoredSettings(newSettings, currentUser?.id);

    if (currentUser && isAppwriteConfigured(newSettings.appwrite)) {
      saveUserPreferences(newSettings.appwrite, {
        theme: newSettings.theme,
        currencyCode: newSettings.currency.code,
        role: activeRole,
      }).catch(console.error);
    }
  };

  // --- INVESTOR CALCULATIONS ---
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
    return partners.find((p) => p.id === selectedPartnerId) || null;
  }, [partners, selectedPartnerId]);

  // --- BUSINESS OPERATOR CALCULATIONS ---
  const customersWithBalance: CustomerWithBalance[] = useMemo(() => {
    return computeCustomerBalances(businessCustomers, businessTransactions);
  }, [businessCustomers, businessTransactions]);

  const businessSummary: BusinessSummary = useMemo(() => {
    return calculateBusinessSummary(businessTransactions, businessCustomers.length, customersWithBalance);
  }, [businessTransactions, businessCustomers, customersWithBalance]);

  // --- INVESTOR ACTION HANDLERS ---
  const handleOpenAddTxModal = (_type?: TransactionType) => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];
    if (existingId) {
      updated = transactions.map((t) =>
        t.id === existingId
          ? {
              ...t,
              ...txData,
            }
          : t
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      updated = [newTx, ...transactions];
    }

    setTransactions(updated);
    saveStoredTransactions(updated, company?.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      const target = updated.find((t) => (existingId ? t.id === existingId : true));
      if (target) {
        saveTransactionToAppwrite(settings.appwrite, target).catch(console.error);
      }
    }
    showSuccess(existingId ? 'Transaction updated.' : 'Transaction recorded.');
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated, company?.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      deleteTransactionFromAppwrite(settings.appwrite, id).catch(console.error);
    }
    showWarning('Transaction deleted.');
  };

  const handleDeleteMultipleTransactions = (ids: string[]) => {
    const idSet = new Set(ids);
    const updated = transactions.filter((t) => !idSet.has(t.id));
    setTransactions(updated);
    saveStoredTransactions(updated, company?.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      deleteMultipleTransactionsFromAppwrite(settings.appwrite, ids).catch(console.error);
    }
    showWarning(`${ids.length} transaction${ids.length !== 1 ? 's' : ''} deleted.`);
  };

  const handleCollectExpectedProfit = (origTx: Transaction) => {
    if (!origTx.expectedProfit || origTx.expectedProfit <= 0) return;

    const profitAmount = origTx.expectedProfit;
    const nowIso = new Date().toISOString().split('T')[0];

    const newProfitTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      partnerId: origTx.partnerId,
      date: nowIso,
      type: 'PROFIT_PAYOUT',
      amount: profitAmount,
      paymentMethod: origTx.paymentMethod || 'Bank Transfer',
      description: `Profit collected for advance from ${origTx.date} (${origTx.description || 'Capital advance'})`,
      reference: origTx.reference ? `Ref: ${origTx.reference}` : undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [newProfitTx, ...transactions];
    setTransactions(updatedTransactions);
    saveStoredTransactions(updatedTransactions, company?.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      saveTransactionToAppwrite(settings.appwrite, newProfitTx).catch(console.error);
    }
    showSuccess('Profit collected and recorded to ledger.');
  };

  const handleSavePartner = async (
    data: Omit<Partner, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Partner[];
    if (existingId) {
      updated = partners.map((p) => (p.id === existingId ? { ...p, ...data } : p));
    } else {
      const newPartner: Partner = {
        ...data,
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      updated = [...partners, newPartner];
    }
    setPartners(updated);
    saveStoredPartners(updated, company?.id);

    if (isAppwriteConfigured(settings.appwrite)) {
      const target = updated.find((p) => (existingId ? p.id === existingId : true));
      if (target) {
        savePartnerToAppwrite(settings.appwrite, target).catch(console.error);
      }
    }
    showSuccess(existingId ? 'Partner updated.' : 'Partner added.');
  };

  const handleDeletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveStoredPartners(updated, company?.id);

    if (selectedPartnerId === id) {
      setSelectedPartnerId('ALL');
    }

    if (isAppwriteConfigured(settings.appwrite)) {
      deletePartnerFromAppwrite(settings.appwrite, id).catch(console.error);
    }
    showWarning('Partner removed.');
  };

  const handleExportCsv = () => {
    const csv = exportToCsv(relevantTransactions, partners);
    const filename = `ledger-statement-${selectedPartnerId}-${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
    showSuccess('CSV exported successfully.');
  };

  // --- BUSINESS OPERATOR ACTION HANDLERS ---
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (cust: BusinessCustomer) => {
    setEditingCustomer(cust);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (
    data: Omit<BusinessCustomer, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: BusinessCustomer[];
    if (existingId) {
      updated = businessCustomers.map((c) => (c.id === existingId ? { ...c, ...data } : c));
    } else {
      const newCustomer: BusinessCustomer = {
        ...data,
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: currentUser?.id || 'guest',
        createdAt: new Date().toISOString(),
      };
      updated = [...businessCustomers, newCustomer];
    }
    setBusinessCustomers(updated);
    saveStoredCustomers(updated, company?.id || currentUser?.id);
    showSuccess(existingId ? 'Customer updated.' : 'Customer added.');
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = businessCustomers.filter((c) => c.id !== id);
    setBusinessCustomers(updated);
    saveStoredCustomers(updated, company?.id || currentUser?.id);
    showWarning('Customer deleted.');
  };

  const handleOpenNewBusinessTx = (type?: BusinessTransactionType, customerId?: string) => {
    setEditingBusinessTx(null);
    setBusinessTxInitialType(type || 'SALE');
    setBusinessTxInitialCustomerId(customerId);
    setIsBusinessTxModalOpen(true);
  };

  const handleOpenEditBusinessTx = (tx: BusinessTransaction) => {
    setEditingBusinessTx(tx);
    setBusinessTxInitialType(tx.type);
    setBusinessTxInitialCustomerId(tx.customerId);
    setIsBusinessTxModalOpen(true);
  };

  const handleSaveBusinessTransaction = (
    data: Omit<BusinessTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: BusinessTransaction[];
    if (existingId) {
      updated = businessTransactions.map((tx) =>
        tx.id === existingId
          ? {
              ...tx,
              ...data,
            }
          : tx
      );
    } else {
      const newTx: BusinessTransaction = {
        ...data,
        id: `btx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: currentUser?.id || 'guest',
        createdAt: new Date().toISOString(),
      };
      updated = [newTx, ...businessTransactions];
    }
    setBusinessTransactions(updated);
    saveStoredBusinessTransactions(updated, company?.id || currentUser?.id);
    showSuccess(existingId ? 'Transaction updated.' : 'Transaction recorded.');
  };

  const handleDeleteBusinessTransaction = (id: string) => {
    const updated = businessTransactions.filter((tx) => tx.id !== id);
    setBusinessTransactions(updated);
    saveStoredBusinessTransactions(updated, company?.id || currentUser?.id);
    showWarning('Transaction deleted.');
  };

  const muiTheme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  // Loading screen content
  const loadingScreen = (
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
        component="img"
        src="/logo.svg"
        alt="CapVenture"
        sx={{
          width: 72,
          height: 72,
          borderRadius: 4,
          boxShadow: '0 12px 32px rgba(59, 130, 246, 0.4)',
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        CapVenture
      </Typography>
      <CircularProgress size={28} thickness={4} />
      <Typography variant="caption" color="text.secondary">
        Verifying security session...
      </Typography>
    </Box>
  );

  if (isCheckingAuth) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {loadingScreen}
      </ThemeProvider>
    );
  }

  // 2. Unauthenticated: Display Auth Page
  if (!currentUser) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthPage
          onLogin={handleLogin}
          onSignup={handleSignup}
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          activeInvitation={activeInvitationForAuth}
        />
      </ThemeProvider>
    );
  }

  // 3. Authenticated: Full Application Access
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        
        {/* Top Material AppBar with Role Switcher */}
        <Navbar
          activeRole={activeRole}
          onSwitchRole={handleSwitchRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          partners={partners}
          selectedPartnerId={selectedPartnerId}
          onSelectPartner={setSelectedPartnerId}
          currentCurrency={settings.currency}
          onSelectCurrency={handleSelectCurrency}
          onOpenTransactionModal={() => handleOpenAddTxModal()}
          onOpenBusinessTxModal={() => handleOpenNewBusinessTx('SALE')}
          onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenTeamModal={() => setIsTeamModalOpen(true)}
          companyName={company?.name}
          isAppwriteEnabled={Boolean(settings.appwrite?.enabled)}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Viewport Container */}
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2.5, md: 3.5 } }}>
          
          {/* ======================================================== */}
          {/* INVESTOR PORTAL VIEWS */}
          {/* ======================================================== */}
          {activeRole === 'INVESTOR' && (
            <>
              {/* Active Partner Filter Banner */}
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
                      {relevantTransactions.slice(0, 5).map((t, idx) => {
                        const isProfit = t.type === 'PROFIT_PAYOUT';
                        const isReturn = t.type === 'PRINCIPAL_RETURN';
                        return (
                          <React.Fragment key={t.id}>
                            {idx > 0 && <Divider component="li" />}
                            <ListItem
                              secondaryAction={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: isProfit
                                      ? 'success.main'
                                      : isReturn
                                      ? 'warning.main'
                                      : 'text.primary',
                                  }}
                                >
                                  {isProfit ? '+' : isReturn ? '↓' : '↑'}
                                  {formatCurrency(t.amount, settings.currency)}
                                </Typography>
                              }
                              sx={{ py: 1.5, px: 0 }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor: isProfit
                                      ? 'success.main'
                                      : isReturn
                                      ? 'warning.main'
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
                                      {partnersMap[t.partnerId]?.name || 'Partner'}
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
                  onCollectProfit={handleCollectExpectedProfit}
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
            </>
          )}

          {/* ======================================================== */}
          {/* BUSINESS OPERATOR PORTAL VIEWS */}
          {/* ======================================================== */}
          {activeRole === 'BUSINESS_OPERATOR' && (
            <>
              {/* BUSINESS OVERVIEW / DASHBOARD */}
              {activeTab === 'business_dashboard' && (
                <BusinessDashboard
                  summary={businessSummary}
                  customersWithBalance={customersWithBalance}
                  recentTransactions={businessTransactions}
                  currency={settings.currency}
                  onOpenTransactionModal={(type, customerId) =>
                    handleOpenNewBusinessTx(type, customerId)
                  }
                  onOpenCustomerModal={handleOpenAddCustomer}
                  onViewAllCustomers={() => setActiveTab('business_customers')}
                  onViewAllTransactions={() => setActiveTab('business_ledger')}
                />
              )}

              {/* BUSINESS SALES & DUES LEDGER */}
              {activeTab === 'business_ledger' && (
                <BusinessLedgerTable
                  transactions={businessTransactions}
                  currency={settings.currency}
                  onEditTransaction={handleOpenEditBusinessTx}
                  onDeleteTransaction={handleDeleteBusinessTransaction}
                  onNewTransaction={(type) => handleOpenNewBusinessTx(type)}
                />
              )}

              {/* CUSTOMERS & RECEIVABLES TABLE */}
              {activeTab === 'business_customers' && (
                <CustomersTable
                  customers={customersWithBalance}
                  currency={settings.currency}
                  onAddCustomer={handleOpenAddCustomer}
                  onEditCustomer={handleOpenEditCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onCollectDue={(cust) =>
                    handleOpenNewBusinessTx('PAYMENT_RECEIVED', cust.id)
                  }
                  onNewSale={(cust) => handleOpenNewBusinessTx('SALE', cust.id)}
                />
              )}
            </>
          )}

        </Container>

        {/* ======================================================== */}
        {/* MODALS */}
        {/* ======================================================== */}

        {/* Investor Modals */}
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
          onUpdateSettings={handleUpdateSettings}
          onDataReloaded={loadAllData}
          onExportCsv={handleExportCsv}
        />

        <TeamModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          currentUser={currentUser}
          company={company}
          onUpdateCompany={handleUpdateCompany}
          onSendInvite={handleSendInvite}
          onRevokeInvite={handleRevokeInvite}
          onConfirmMember={handleConfirmMember}
          onRefreshSync={handleRefreshTeamSync}
          onRemoveMember={handleRemoveMember}
          invitations={invitations}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onContinueAsGuest={() => setIsAuthModalOpen(false)}
          activeInvitation={activeInvitationForAuth}
        />

        {/* Business Operator Modals */}
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          editingCustomer={editingCustomer}
        />

        <BusinessTransactionModal
          isOpen={isBusinessTxModalOpen}
          onClose={() => {
            setIsBusinessTxModalOpen(false);
            setEditingBusinessTx(null);
            setBusinessTxInitialCustomerId(undefined);
          }}
          onSave={handleSaveBusinessTransaction}
          customers={businessCustomers}
          editingTransaction={editingBusinessTx}
          currency={settings.currency}
          initialType={businessTxInitialType}
          initialCustomerId={businessTxInitialCustomerId}
          onOpenCustomerModal={() => {
            setIsCustomerModalOpen(true);
          }}
        />

        {/* App Footer */}
        <Box
          component="footer"
          sx={{
            py: 2.5,
            px: 2,
            textAlign: 'center',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mt: 'auto',
          }}
          className="no-print"
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.775rem' }}>
            © {new Date().getFullYear()} CapVenture — Intelligent Capital & Business Portfolio Tracker
          </Typography>
        </Box>

      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
