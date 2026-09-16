import React from 'react';
import { Printer, FileText } from 'lucide-react';
import { CurrencyConfig, FinancialSummary, Partner, TransactionWithRunningBalance } from '../types';
import { formatCurrency } from '../utils/calculations';

interface StatementViewProps {
  partner: Partner | null;
  allPartners: Partner[];
  onSelectPartner: (id: string) => void;
  transactionsWithBalance: TransactionWithRunningBalance[];
  summary: FinancialSummary;
  currency: CurrencyConfig;
}

export const StatementView: React.FC<StatementViewProps> = ({
  partner,
  allPartners,
  onSelectPartner,
  transactionsWithBalance,
  summary,
  currency,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 no-print">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            Partner Statement of Account
          </h2>
          <p className="text-xs text-slate-400">
            Generate an official settlement & balance statement to share with your business partner or borrower
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Partner Selector */}
          <select
            value={partner?.id || 'ALL'}
            onChange={(e) => onSelectPartner(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer flex-1 sm:flex-none"
          >
            <option value="ALL">All Consolidated Records</option>
            {allPartners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Document */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-100 p-6 sm:p-10 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-gray-300 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 print:text-emerald-700 mb-1">
              Official Statement of Investment & Accounts
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white print:text-black">
              CAPITAL & PROFIT SETTLEMENT
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-500 mt-1">
              Statement Date: <strong>{currentDate}</strong>
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-slate-400 print:text-gray-500">Prepared For:</div>
            <div className="text-base font-bold text-white print:text-black">
              {partner ? partner.name : 'Consolidated Portfolio (All Partners)'}
            </div>
            {partner?.phone && (
              <div className="text-xs text-slate-400 print:text-gray-600">Tel: {partner.phone}</div>
            )}
            {partner?.email && (
              <div className="text-xs text-slate-400 print:text-gray-600">Email: {partner.email}</div>
            )}
          </div>
        </div>

        {/* Executive Settlement Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 print:bg-gray-50 print:border-gray-200 mb-6">
          <div>
            <div className="text-[11px] text-slate-400 print:text-gray-500 uppercase font-semibold">
              Total Capital Advanced
            </div>
            <div className="text-lg font-bold text-white print:text-black mt-0.5">
              {formatCurrency(summary.totalInvested, currency)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 print:text-gray-500 uppercase font-semibold">
              Principal Repaid
            </div>
            <div className="text-lg font-bold text-amber-400 print:text-amber-700 mt-0.5">
              {formatCurrency(summary.totalPrincipalReturned, currency)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-400 print:text-emerald-700 uppercase font-semibold">
              Profit Payouts Settled
            </div>
            <div className="text-lg font-bold text-emerald-400 print:text-emerald-700 mt-0.5">
              +{formatCurrency(summary.totalProfitRealized, currency)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 print:text-gray-500 uppercase font-semibold">
              Current Balance Owed
            </div>
            <div className="text-lg font-extrabold text-teal-300 print:text-blue-900 mt-0.5">
              {formatCurrency(summary.activeCapital, currency)}
            </div>
          </div>
        </div>

        {/* Terms memo if partner specified */}
        {partner?.notes && (
          <div className="mb-6 p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300 print:bg-gray-100 print:text-gray-800 print:border-gray-300">
            <strong>Investment Terms:</strong> {partner.notes}
          </div>
        )}

        {/* Itemized Chronological Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 print:border-gray-400 bg-slate-950/40 print:bg-gray-100 text-[11px] font-bold text-slate-400 print:text-gray-700 uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description / Reference</th>
                <th className="py-2.5 px-3 text-right">Debit (Invested)</th>
                <th className="py-2.5 px-3 text-right">Credit (Returned)</th>
                <th className="py-2.5 px-3 text-right">Profit Paid</th>
                <th className="py-2.5 px-3 text-right">Principal Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 print:divide-gray-300">
              {transactionsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 print:text-gray-500">
                    No transactions recorded for this period.
                  </td>
                </tr>
              ) : (
                // Re-reverse to print chronologically ascending
                [...transactionsWithBalance].reverse().map((t) => {
                  const isInvest = t.type === 'INVESTMENT_OUT';
                  const isReturn = t.type === 'PRINCIPAL_RETURN';
                  const isProfit = t.type === 'PROFIT_PAYOUT';
                  const isReinvest = t.type === 'REINVEST';

                  return (
                    <tr key={t.id} className="print:text-black">
                      <td className="py-2.5 px-3 font-medium text-slate-300 print:text-gray-900 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isInvest && <span className="text-blue-400 print:text-blue-800 font-semibold">Capital Advance</span>}
                        {isReturn && <span className="text-amber-400 print:text-amber-800 font-semibold">Principal Repayment</span>}
                        {isProfit && <span className="text-emerald-400 print:text-emerald-800 font-semibold">Profit Payout</span>}
                        {isReinvest && <span className="text-purple-400 print:text-purple-800 font-semibold">Profit Reinvest</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 print:text-gray-800">
                        {t.description}
                        {t.reference && <span className="text-slate-500 print:text-gray-600 ml-1">({t.reference})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-blue-300 print:text-blue-900">
                        {isInvest || isReinvest ? formatCurrency(t.amount, currency) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-amber-400 print:text-amber-800">
                        {isReturn ? formatCurrency(t.amount, currency) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-400 print:text-emerald-800">
                        {isProfit || isReinvest ? formatCurrency(t.amount, currency) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                        {formatCurrency(t.runningPrincipal, currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 print:border-gray-800 font-bold bg-slate-950/60 print:bg-gray-100">
                <td colSpan={3} className="py-3 px-3 uppercase text-[11px] text-slate-300 print:text-gray-900">
                  Total Closing Principal Outstanding:
                </td>
                <td colSpan={4} className="py-3 px-3 text-right text-sm font-extrabold text-emerald-400 print:text-emerald-800 font-mono">
                  {formatCurrency(summary.activeCapital, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures Section (Ideal for printing agreements) */}
        <div className="mt-12 pt-8 border-t border-slate-800 print:border-gray-300 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-gray-700">
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-12 mb-2" />
            <div className="font-semibold text-slate-200 print:text-black">Investor Signature & Date</div>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-gray-400 pb-12 mb-2" />
            <div className="font-semibold text-slate-200 print:text-black">Partner / Borrower Signature & Date</div>
          </div>
        </div>

      </div>

    </div>
  );
};
