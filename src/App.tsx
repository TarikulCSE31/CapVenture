import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { LedgerTable } from './components/LedgerTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { StatementView } from './components/StatementView';
import { TransactionModal } from './components/TransactionModal';
import { PartnerModal } from './components/PartnerModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Partner, 
  Transaction, 
  TransactionType,
  AppSettings
} from './types';
import { 
  getStoredPartners, 
  saveStoredPartners, 
  getStoredTransactions, 
  saveStoredTransactions, 
  getStoredSettings, 
  saveStoredSettings,
  exportToCsv,
  triggerDownload
} from './utils/storage';
import { 
  calculateSummary, 
  computeRunningBalances, 
  formatCurrency 
} from './utils/calculations';
import { 
  ArrowDownRight, 
  ArrowUpLeft, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  Phone,
  Mail
} from 'lucide-react';

export default function App() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'statement'>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const loadedPartners = getStoredPartners();
    const loadedTransactions = getStoredTransactions();
    const loadedSettings = getStoredSettings();
    setPartners(loadedPartners);
    setTransactions(loadedTransactions);
    setSettings(loadedSettings);
  };

  // Partners Map for O(1) lookup
  const partnersMap = useMemo(() => {
    const map: Record<string, Partner> = {};
    for (const p of partners) {
      map[p.id] = p;
    }
    return map;
  }, [partners]);

  // Filtered transactions based on selected partner
  const relevantTransactions = useMemo(() => {
    if (selectedPartnerId === 'ALL') return transactions;
    return transactions.filter((t) => t.partnerId === selectedPartnerId);
  }, [transactions, selectedPartnerId]);

  // Overall calculations
  const summary = useMemo(() => {
    return calculateSummary(relevantTransactions);
  }, [relevantTransactions]);

  // Chronological running balances
  const transactionsWithBalance = useMemo(() => {
    return computeRunningBalances(relevantTransactions, partnersMap);
  }, [relevantTransactions, partnersMap]);

  // Active selected partner object
  const activePartner = useMemo(() => {
    if (selectedPartnerId === 'ALL') return null;
    return partnersMap[selectedPartnerId] || null;
  }, [selectedPartnerId, partnersMap]);

  // Handlers for Transactions
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Transaction[];
    if (existingId) {
      updated = transactions.map((t) =>
        t.id === existingId ? { ...t, ...data } : t
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      updated = [newTx, ...transactions];
    }
    setTransactions(updated);
    saveStoredTransactions(updated);
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
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

  // Handlers for Partners
  const handleSavePartner = (
    data: Omit<Partner, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let updated: Partner[];
    if (existingId) {
      updated = partners.map((p) =>
        p.id === existingId ? { ...p, ...data } : p
      );
    } else {
      const newPartner: Partner = {
        ...data,
        id: `partner-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updated = [...partners, newPartner];
      // Automatically select newly created partner if user was on 'ALL' or wanting to focus
      setSelectedPartnerId(newPartner.id);
    }
    setPartners(updated);
    saveStoredPartners(updated);
  };

  const handleDeletePartner = (id: string) => {
    const updated = partners.filter((p) => p.id !== id);
    setPartners(updated);
    saveStoredPartners(updated);
    if (selectedPartnerId === id) {
      setSelectedPartnerId('ALL');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportToCsv(relevantTransactions, partners);
    const filename = `ledger-statement-${selectedPartnerId}-${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Partner Context Banner (if single partner filtered) */}
        {activePartner && (
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/30 no-print">
            <div className="flex items-center gap-3.5">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-slate-950 font-bold text-lg shadow-md"
                style={{ backgroundColor: activePartner.avatarColor || '#10b981' }}
              >
                {activePartner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">{activePartner.name}</h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Partner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  {activePartner.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {activePartner.phone}
                    </span>
                  )}
                  {activePartner.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {activePartner.email}
                    </span>
                  )}
                  {activePartner.notes && (
                    <span className="italic text-slate-400">
                      Memo: {activePartner.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => setSelectedPartnerId('ALL')}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
              >
                View All Partners
              </button>
              <button
                onClick={() => setActiveTab('statement')}
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors"
              >
                View Statement
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KPI Cards */}
            <KpiCards summary={summary} currency={settings.currency} />

            {/* Quick Action Shortcut Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
              <button
                onClick={() => handleOpenAddTxModal('INVESTMENT_OUT')}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ArrowDownRight className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Disburse Capital</div>
                    <div className="text-[11px] text-slate-400">Invest more funds with partner</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </button>

              <button
                onClick={() => handleOpenAddTxModal('PRINCIPAL_RETURN')}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ArrowUpLeft className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Record Principal Return</div>
                    <div className="text-[11px] text-slate-400">Reduce balance owed to you</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                onClick={() => handleOpenAddTxModal('PROFIT_PAYOUT')}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Record Profit Payout</div>
                    <div className="text-[11px] text-slate-400">Collect return without touching principal</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>

            {/* Visual Analytics & Charts */}
            <AnalyticsCharts
              transactions={relevantTransactions}
              summary={summary}
              currency={settings.currency}
            />

            {/* Recent Activity Mini-Feed */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
                </div>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Open Full Ledger</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                {transactionsWithBalance.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        t.type === 'PROFIT_PAYOUT'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.type === 'PRINCIPAL_RETURN'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {t.type === 'PROFIT_PAYOUT' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : t.type === 'PRINCIPAL_RETURN' ? (
                          <ArrowUpLeft className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{t.partnerName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({t.date})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{t.description}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-bold ${
                        t.type === 'PROFIT_PAYOUT' || t.type === 'REINVEST'
                          ? 'text-emerald-400'
                          : t.type === 'PRINCIPAL_RETURN'
                          ? 'text-amber-400'
                          : 'text-blue-300'
                      }`}>
                        {t.type === 'PROFIT_PAYOUT' ? '+' : ''}
                        {formatCurrency(t.amount, settings.currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Bal: {formatCurrency(t.runningPrincipal, settings.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FULL LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-fadeIn">
            <LedgerTable
              transactionsWithBalance={transactionsWithBalance}
              currency={settings.currency}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onExportCsv={handleExportCsv}
              onOpenAddModal={() => handleOpenAddTxModal()}
            />
          </div>
        )}

        {/* TAB 3: STATEMENT OF ACCOUNT */}
        {activeTab === 'statement' && (
          <div className="space-y-6 animate-fadeIn">
            <StatementView
              partner={activePartner}
              allPartners={partners}
              onSelectPartner={setSelectedPartnerId}
              transactionsWithBalance={transactionsWithBalance}
              summary={summary}
              currency={settings.currency}
            />
          </div>
        )}

      </main>

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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 no-print">
        CapVenture • Zero-Cost Self-Hosted Business Investment & Profit Tracker • 100% Free & Private
      </footer>

    </div>
  );
}
