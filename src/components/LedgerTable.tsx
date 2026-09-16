import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpLeft, 
  TrendingUp, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Download, 
  ArrowUpDown, 
  Layers
} from 'lucide-react';
import { CurrencyConfig, Transaction, TransactionType, TransactionWithRunningBalance } from '../types';
import { formatCurrency } from '../utils/calculations';

interface LedgerTableProps {
  transactionsWithBalance: TransactionWithRunningBalance[];
  currency: CurrencyConfig;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
  onOpenAddModal: () => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactionsWithBalance,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onExportCsv,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered & Sorted list
  const filtered = useMemo(() => {
    return transactionsWithBalance
      .filter((t) => {
        if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const partnerMatch = (t.partnerName || '').toLowerCase().includes(term);
        const descMatch = (t.description || '').toLowerCase().includes(term);
        const refMatch = (t.reference || '').toLowerCase().includes(term);
        const amtMatch = t.amount.toString().includes(term);
        return partnerMatch || descMatch || refMatch || amtMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [transactionsWithBalance, typeFilter, searchTerm, sortOrder]);

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'INVESTMENT_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ArrowDownRight className="h-3 w-3" />
            Capital Out
          </span>
        );
      case 'PRINCIPAL_RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ArrowUpLeft className="h-3 w-3" />
            Principal Back
          </span>
        );
      case 'PROFIT_PAYOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-3 w-3" />
            Profit Share
          </span>
        );
      case 'REINVEST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RefreshCw className="h-3 w-3" />
            Reinvested
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-xl">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memo, partner, reference, amount..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Capital Out', value: 'INVESTMENT_OUT' },
              { label: 'Principal Back', value: 'PRINCIPAL_RETURN' },
              { label: 'Profit', value: 'PROFIT_PAYOUT' },
              { label: 'Reinvested', value: 'REINVEST' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  typeFilter === tab.value
                    ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions: Sort & Export */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Toggle sort date"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Export full ledger to CSV/Excel"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

      </div>

      {/* Ledger Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Date</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Partner</th>
              <th className="py-3.5 px-4">Description & Ref</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Running Principal</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="h-8 w-8 text-slate-600 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-400">No transactions found</p>
                    <p className="text-xs text-slate-500">
                      Try adjusting your filters or record a new transaction entry.
                    </p>
                    <button
                      onClick={onOpenAddModal}
                      className="mt-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                    >
                      + Record First Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isReturn = t.type === 'PRINCIPAL_RETURN';
                const isProfit = t.type === 'PROFIT_PAYOUT';
                const isReinvest = t.type === 'REINVEST';

                return (
                  <tr 
                    key={t.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-300 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Category Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(t.type)}
                    </td>

                    {/* Partner Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{t.partnerName}</span>
                      </div>
                    </td>

                    {/* Description & Reference */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-medium text-slate-200 truncate" title={t.description}>
                        {t.description || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        {t.paymentMethod && <span>via {t.paymentMethod}</span>}
                        {t.reference && (
                          <span className="font-mono text-slate-400 bg-slate-800/60 px-1 rounded">
                            #{t.reference}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                      <span className={
                        isProfit || isReinvest 
                          ? 'text-emerald-400' 
                          : isReturn 
                          ? 'text-amber-400' 
                          : 'text-blue-300'
                      }>
                        {isProfit ? '+' : ''}
                        {formatCurrency(t.amount, currency)}
                      </span>
                    </td>

                    {/* Running Principal */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-300 whitespace-nowrap">
                      {formatCurrency(t.runningPrincipal, currency)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(t)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete transaction for ${formatCurrency(t.amount, currency)} on ${t.date}?`)) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      {filtered.length > 0 && (
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>
            Showing <strong className="text-white">{filtered.length}</strong> of{' '}
            <strong className="text-white">{transactionsWithBalance.length}</strong> total records
          </span>
          <div className="flex items-center gap-4">
            <span>
              Principal in active view:{' '}
              <strong className="text-white font-mono">
                {formatCurrency(filtered[0]?.runningPrincipal || 0, currency)}
              </strong>
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
