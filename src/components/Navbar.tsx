import React from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Settings, 
  FileSpreadsheet, 
  FileText, 
  LayoutDashboard
} from 'lucide-react';
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
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  CapVenture
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Pro
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Investment & Profit Capital Ledger</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Ledger Transactions
            </button>
            <button
              onClick={() => setActiveTab('statement')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'statement'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Statement of Account
            </button>
          </nav>

          {/* Partner & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Partner Switcher */}
            <div className="relative">
              <select
                value={selectedPartnerId}
                onChange={(e) => onSelectPartner(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                title="Filter by partner/borrower"
              >
                <option value="ALL">🌐 All Partners ({partners.length})</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    👤 {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="relative hidden lg:block">
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const found = DEFAULT_CURRENCIES.find((c: CurrencyConfig) => c.code === e.target.value);
                  if (found) onSelectCurrency(found);
                }}
                className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                title="Change currency symbol"
              >
                {DEFAULT_CURRENCIES.map((c: CurrencyConfig) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Manage Partners Button */}
            <button
              onClick={onOpenPartnerModal}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors"
              title="Manage Partners"
            >
              <Users className="h-4 w-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettingsModal}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-colors"
              title="Settings & Cloud Sync"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenTransactionModal}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Record Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-xs py-1 px-2.5 rounded-md font-medium ${
              activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`text-xs py-1 px-2.5 rounded-md font-medium ${
              activeTab === 'ledger' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('statement')}
            className={`text-xs py-1 px-2.5 rounded-md font-medium ${
              activeTab === 'statement' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Statement
          </button>
        </div>

      </div>
    </header>
  );
};
