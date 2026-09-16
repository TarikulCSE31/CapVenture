import { BusinessCustomer, BusinessSummary, BusinessTransaction, CustomerWithBalance } from '../types';

/**
 * Compute financial overview for the Business Operator portal
 */
export function calculateBusinessSummary(
  transactions: BusinessTransaction[],
  customerCount: number = 0,
  customersWithBalance?: CustomerWithBalance[]
): BusinessSummary {
  let totalSales = 0;
  let totalCashCollected = 0;
  let totalExpenses = 0;
  let totalCreditDuesCreated = 0;
  let totalDueCollected = 0;

  for (const tx of transactions) {
    const total = Number(tx.totalAmount) || 0;
    const paid = Number(tx.paidAmount) || 0;
    const due = Number(tx.dueAmount) || 0;

    switch (tx.type) {
      case 'SALE':
        totalSales += total;
        totalCashCollected += paid > 0 ? paid : total;
        break;

      case 'CREDIT_SALE':
        totalSales += total;
        totalCashCollected += paid;
        totalCreditDuesCreated += due > 0 ? due : Math.max(0, total - paid);
        break;

      case 'PAYMENT_RECEIVED': {
        const payment = paid > 0 ? paid : total;
        totalCashCollected += payment;
        totalDueCollected += payment;
        break;
      }

      case 'EXPENSE':
        totalExpenses += total;
        break;
    }
  }

  // Total customer due: if customer balances are computed, use the exact sum;
  // otherwise subtract collected dues from total credit dues created.
  const totalCustomerDue = customersWithBalance
    ? customersWithBalance.reduce((sum, c) => sum + c.totalDue, 0)
    : Math.max(0, totalCreditDuesCreated - totalDueCollected);

  const netOperatingProfit = totalSales - totalExpenses;

  return {
    totalSales,
    totalCashCollected,
    totalCustomerDue,
    totalExpenses,
    netOperatingProfit,
    transactionCount: transactions.length,
    customerCount,
  };
}

/**
 * Compute running dues and purchase history for each customer
 */
export function computeCustomerBalances(
  customers: BusinessCustomer[],
  transactions: BusinessTransaction[]
): CustomerWithBalance[] {
  return customers.map((customer) => {
    const customerTxs = transactions.filter((tx) => tx.customerId === customer.id);

    let totalSales = 0;
    let totalPaid = 0;
    let lastDate: string | undefined = undefined;

    const sorted = [...customerTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const tx of sorted) {
      const total = Number(tx.totalAmount) || 0;
      const paid = Number(tx.paidAmount) || 0;

      if (tx.type === 'SALE' || tx.type === 'CREDIT_SALE') {
        totalSales += total;
        totalPaid += paid;
      } else if (tx.type === 'PAYMENT_RECEIVED') {
        totalPaid += paid > 0 ? paid : total;
      }

      lastDate = tx.date;
    }

    const totalDue = Math.max(0, totalSales - totalPaid);

    return {
      ...customer,
      totalSales,
      totalPaid,
      totalDue,
      transactionCount: customerTxs.length,
      lastTransactionDate: lastDate,
    };
  });
}
