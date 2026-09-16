import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CurrencyConfig, FinancialSummary, Transaction } from '../types';
import { formatCurrency, generateCumulativeTimeline, generateMonthlyData } from '../utils/calculations';
import { TrendingUp, BarChart3, Activity, PieChart } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  currency: CurrencyConfig;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  summary,
  currency,
}) => {
  const timelineData = React.useMemo(() => generateCumulativeTimeline(transactions), [transactions]);
  const monthlyData = React.useMemo(() => generateMonthlyData(transactions), [transactions]);

  // Average monthly profit
  const avgMonthlyProfit = React.useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const totalProf = monthlyData.reduce((acc, curr) => acc + curr.profit, 0);
    return totalProf / monthlyData.length;
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      
      {/* Top Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Break-Even Health Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Capital Break-Even Tracker</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-white">
                {summary.recoveryPercentage.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">
                {summary.isBreakEvenReached ? 'Goal Achieved!' : 'Capital Recovered'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  summary.isBreakEvenReached ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.recoveryPercentage))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {summary.isBreakEvenReached ? (
                <span className="text-emerald-400 font-medium">
                  🎉 You have recovered all capital! Every new profit payout is 100% net surplus.
                </span>
              ) : (
                <span>
                  Total returned + profit: {formatCurrency(summary.totalPrincipalReturned + summary.totalProfitRealized, currency)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 2. Monthly Velocity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Avg Monthly Profit</span>
            <TrendingUp className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-emerald-400">
              +{formatCurrency(avgMonthlyProfit, currency)}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Based on active investment history across {monthlyData.length} active recorded months.
            </p>
          </div>
        </div>

        {/* 3. Capital Efficiency Ratio */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Cumulative Return (ROI)</span>
            <PieChart className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-teal-300">
              {summary.roiPercentage.toFixed(1)}% ROI
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Total profit earned as a proportion of total capital put at risk ({formatCurrency(summary.totalInvested, currency)}).
            </p>
          </div>
        </div>

      </div>

      {/* Chart 1: Cumulative Capital vs Profit Trajectory */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Capital Out vs. Cumulative Profit Over Time
            </h3>
            <p className="text-xs text-slate-400">
              Tracks how your principal lent fluctuates against your steadily growing profit pile
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> Active Principal
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Cumulative Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currency.symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: any, name: any) => {
                    const formatted = formatCurrency(Number(value) || 0, currency);
                    if (name === 'activeCapital') return [formatted, 'Active Principal Owed'];
                    if (name === 'cumulativeProfit') return [formatted, 'Cumulative Profit'];
                    return [formatted, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activeCapital"
                  name="activeCapital"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrincipal)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="cumulativeProfit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Record transactions to generate timeline charts
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Monthly Inflows and Outflows */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-400" />
              Monthly Cash Flow & Profit Volume
            </h3>
            <p className="text-xs text-slate-400">
              Compare capital injected vs. repayments and profit distributions month-by-month
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currency.symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(value: any, name: any) => {
                    const formatted = formatCurrency(Number(value) || 0, currency);
                    if (name === 'invested') return [formatted, 'Capital Invested'];
                    if (name === 'returned') return [formatted, 'Principal Returned'];
                    if (name === 'profit') return [formatted, 'Profit Earned'];
                    return [formatted, name];
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
                <Bar dataKey="invested" name="Capital Invested" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" name="Principal Returned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit Earned" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No monthly activity to display yet
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
