import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import { CurrencyConfig, FinancialSummary } from '../types';
import { formatCurrency } from '../utils/calculations';

interface KpiCardsProps {
  summary: FinancialSummary;
  currency: CurrencyConfig;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, currency }) => {
  const returnRate = summary.totalInvested > 0 
    ? (summary.totalPrincipalReturned / summary.totalInvested) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Active Capital Deployed (Principal) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Capital Out
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.activeCapital, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Principal currently held by partner
          </p>
        </div>

        {/* Mini progress bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Principal Returned</span>
            <span className="font-medium text-slate-300">{returnRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, returnRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Profit Realized */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Total Profit Realized
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            +{formatCurrency(summary.totalProfitRealized, currency)}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              {summary.roiPercentage.toFixed(1)}% ROI
            </span>
            <span className="text-xs text-slate-400">on invested capital</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Profit Payouts</span>
          <span className="font-semibold text-emerald-400">Direct Earnings</span>
        </div>
      </div>

      {/* 3. Net Cash Position (Break-Even) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Net Cash Flow
          </span>
          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
            summary.netCashFlow >= 0 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {summary.netCashFlow >= 0 ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </div>
        </div>

        <div className="mt-3">
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            summary.netCashFlow >= 0 ? 'text-teal-300' : 'text-slate-200'
          }`}>
            {summary.netCashFlow >= 0 ? '+' : ''}
            {formatCurrency(summary.netCashFlow, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {summary.netCashFlow >= 0 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                ✓ 100% Capital Recovered (Pure Profit)
              </span>
            ) : (
              <span>
                {formatCurrency(Math.abs(summary.netCashFlow), currency)} to reach break-even
              </span>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Cash In vs Cash Out</span>
          <span className={`font-semibold ${summary.netCashFlow >= 0 ? 'text-teal-400' : 'text-slate-300'}`}>
            {summary.recoveryPercentage.toFixed(1)}% Recovered
          </span>
        </div>
      </div>

      {/* 4. Total Capital In/Out Turnover */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-5 shadow-lg shadow-black/40 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Capital Injected
          </span>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.totalInvested, currency)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Cumulative money deployed to date
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Total Principal Paid Back</span>
          <span className="font-semibold text-slate-200">
            {formatCurrency(summary.totalPrincipalReturned, currency)}
          </span>
        </div>
      </div>

    </div>
  );
};
