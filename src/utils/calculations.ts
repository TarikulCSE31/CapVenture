import { FinancialSummary, MonthlyDataPoint, Partner, Transaction, TransactionWithRunningBalance, CurrencyConfig, DEFAULT_CURRENCIES } from '../types';

export function formatCurrency(amount: number, currency: CurrencyConfig = DEFAULT_CURRENCIES[0]): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency.symbol} ${formatted}`;
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  let totalInvested = 0;
  let totalPrincipalReturned = 0;
  let totalProfitRealized = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    switch (t.type) {
      case 'INVESTMENT_OUT':
        totalInvested += amt;
        break;
      case 'PRINCIPAL_RETURN':
        totalPrincipalReturned += amt;
        break;
      case 'PROFIT_PAYOUT':
        totalProfitRealized += amt;
        break;
      case 'REINVEST':
        totalInvested += amt;
        totalProfitRealized += amt;
        break;
    }
  }

  const activeCapital = Math.max(0, totalInvested - totalPrincipalReturned);
  const totalRecovered = totalPrincipalReturned + totalProfitRealized;
  const netCashFlow = totalRecovered - totalInvested;
  const roiPercentage = totalInvested > 0 ? (totalProfitRealized / totalInvested) * 100 : 0;
  const recoveryPercentage = totalInvested > 0 ? Math.min(100, (totalRecovered / totalInvested) * 100) : 0;

  return {
    totalInvested,
    totalPrincipalReturned,
    activeCapital,
    totalProfitRealized,
    netCashFlow,
    roiPercentage,
    recoveryPercentage,
    isBreakEvenReached: netCashFlow >= 0 && totalInvested > 0,
    transactionCount: transactions.length,
  };
}

export function computeRunningBalances(
  transactions: Transaction[],
  partnersMap: Record<string, Partner>
): TransactionWithRunningBalance[] {
  // Sort ascending by date & creation time to compute chronological running balance
  const sorted = [...transactions].sort((a, b) => {
    const d1 = new Date(a.date).getTime();
    const d2 = new Date(b.date).getTime();
    if (d1 !== d2) return d1 - d2;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  let runningPrincipal = 0;
  let runningProfit = 0;

  const withBalances: TransactionWithRunningBalance[] = sorted.map((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'INVESTMENT_OUT') {
      runningPrincipal += amt;
    } else if (t.type === 'PRINCIPAL_RETURN') {
      runningPrincipal = Math.max(0, runningPrincipal - amt);
    } else if (t.type === 'PROFIT_PAYOUT') {
      runningProfit += amt;
    } else if (t.type === 'REINVEST') {
      runningPrincipal += amt;
      runningProfit += amt;
    }

    return {
      ...t,
      runningPrincipal,
      runningProfit,
      partnerName: partnersMap[t.partnerId]?.name || 'Unknown Partner',
    };
  });

  // Return in descending order (most recent first) for display
  return withBalances.reverse();
}

export function generateMonthlyData(transactions: Transaction[]): MonthlyDataPoint[] {
  if (transactions.length === 0) return [];

  const map = new Map<string, { invested: number; returned: number; profit: number }>();

  // Sort ascending
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const t of sorted) {
    const d = new Date(t.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const curr = map.get(monthKey) || { invested: 0, returned: 0, profit: 0 };
    const amt = Number(t.amount) || 0;

    if (t.type === 'INVESTMENT_OUT') {
      curr.invested += amt;
    } else if (t.type === 'PRINCIPAL_RETURN') {
      curr.returned += amt;
    } else if (t.type === 'PROFIT_PAYOUT') {
      curr.profit += amt;
    } else if (t.type === 'REINVEST') {
      curr.invested += amt;
      curr.profit += amt;
    }
    map.set(monthKey, curr);
  }

  const result: MonthlyDataPoint[] = [];
  const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [key, val] of entries) {
    const [year, month] = key.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    const label = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
    const netCash = (val.returned + val.profit) - val.invested;

    result.push({
      monthKey: key,
      label,
      invested: val.invested,
      returned: val.returned,
      profit: val.profit,
      netCash,
    });
  }

  return result;
}

export function generateCumulativeTimeline(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let principal = 0;
  let cumulativeProfit = 0;
  let cumulativeInvested = 0;
  let cumulativeReturned = 0;

  const points: {
    date: string;
    formattedDate: string;
    activeCapital: number;
    cumulativeProfit: number;
    cumulativeInvested: number;
    cumulativeReturned: number;
  }[] = [];

  for (const t of sorted) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'INVESTMENT_OUT') {
      principal += amt;
      cumulativeInvested += amt;
    } else if (t.type === 'PRINCIPAL_RETURN') {
      principal = Math.max(0, principal - amt);
      cumulativeReturned += amt;
    } else if (t.type === 'PROFIT_PAYOUT') {
      cumulativeProfit += amt;
    } else if (t.type === 'REINVEST') {
      principal += amt;
      cumulativeInvested += amt;
      cumulativeProfit += amt;
    }

    const d = new Date(t.date);
    points.push({
      date: t.date,
      formattedDate: d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: '2-digit' }),
      activeCapital: principal,
      cumulativeProfit,
      cumulativeInvested,
      cumulativeReturned,
    });
  }

  return points;
}
