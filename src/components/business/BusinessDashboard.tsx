import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Avatar,
  Paper,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  WarningAmber,
  MoneyOff,
  AttachMoney,
  AddShoppingCart,
  ReceiptLong,
  PriceCheck,
  PersonAdd,
  TrendingDown,
  ChevronRight,
} from '@mui/icons-material';
import {
  BusinessSummary,
  CustomerWithBalance,
  BusinessTransaction,
  CurrencyConfig,
  BusinessTransactionType,
} from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface BusinessDashboardProps {
  summary: BusinessSummary;
  customersWithBalance: CustomerWithBalance[];
  recentTransactions: BusinessTransaction[];
  currency: CurrencyConfig;
  onOpenTransactionModal: (type?: BusinessTransactionType, customerId?: string) => void;
  onOpenCustomerModal: () => void;
  onViewAllCustomers: () => void;
  onViewAllTransactions: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  summary,
  customersWithBalance,
  recentTransactions,
  currency,
  onOpenTransactionModal,
  onOpenCustomerModal,
  onViewAllCustomers,
  onViewAllTransactions,
}) => {
  const theme = useTheme();

  const totalCustomersWithDue = customersWithBalance.filter((c) => c.totalDue > 0).length;

  const topDueCustomers = [...customersWithBalance]
    .filter((c) => c.totalDue > 0)
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 5);

  const kpis = [
    {
      title: 'TOTAL SALES',
      value: formatCurrency(summary.totalSales, currency),
      subtext: `${summary.transactionCount} transactions recorded`,
      icon: <TrendingUp />,
      color: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      title: 'CASH COLLECTED',
      value: formatCurrency(summary.totalCashCollected, currency),
      subtext: summary.totalSales > 0 
        ? `${Math.round((summary.totalCashCollected / summary.totalSales) * 100)}% of sales collected`
        : 'Upfront & due payments',
      icon: <AttachMoney />,
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.1),
    },
    {
      title: 'CUSTOMER DUES (RECEIVABLE)',
      value: formatCurrency(summary.totalCustomerDue, currency),
      subtext: `${totalCustomersWithDue} customers with outstanding balance`,
      icon: <WarningAmber />,
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.1),
    },
    {
      title: 'OPERATING EXPENSES',
      value: formatCurrency(summary.totalExpenses, currency),
      subtext: 'Operational & shop costs',
      icon: <MoneyOff />,
      color: theme.palette.error.main,
      bgcolor: alpha(theme.palette.error.main, 0.1),
    },
    {
      title: 'NET OPERATING PROFIT',
      value: formatCurrency(summary.netOperatingProfit, currency),
      subtext: 'Gross Sales − Total Expenses',
      icon: <AccountBalanceWallet />,
      color: summary.netOperatingProfit >= 0 ? '#10b981' : theme.palette.error.main,
      bgcolor: alpha(summary.netOperatingProfit >= 0 ? '#10b981' : theme.palette.error.main, 0.1),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Quick Action Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Business Operations
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Quickly record sales, track customer dues, or log expenses
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: { xs: '100%', md: 'auto' }, '& > button': { flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' }, fontSize: { xs: '0.8rem', sm: '0.875rem' }, py: { xs: 0.8, sm: 0.9 } } }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddShoppingCart />}
            onClick={() => onOpenTransactionModal('SALE')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Cash Sale
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<ReceiptLong />}
            onClick={() => onOpenTransactionModal('CREDIT_SALE')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Credit Sale (Due)
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<PriceCheck />}
            onClick={() => onOpenTransactionModal('PAYMENT_RECEIVED')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Collect Due
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={onOpenCustomerModal}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            New Customer
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<TrendingDown />}
            onClick={() => onOpenTransactionModal('EXPENSE')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Log Expense
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: idx === 4 ? 12 : 6, sm: 6, md: idx === 4 ? 12 : 3 }} key={kpi.title}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 1.75, sm: 2.5 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                  {kpi.title}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: kpi.bgcolor,
                    color: kpi.color,
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  {kpi.icon}
                </Avatar>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2.125rem' }, wordBreak: 'break-word' }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  {kpi.subtext}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Two Column Section: Top Customer Dues & Recent Activity */}
      <Grid container spacing={3}>
        {/* Left: Top Outstanding Dues */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Customer Dues (Receivables)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customers with highest outstanding balances
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight />}
                onClick={onViewAllCustomers}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {topDueCustomers.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  🎉 Great job! No outstanding customer dues at the moment.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {topDueCustomers.map((c) => (
                  <Paper
                    key={c.id}
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: alpha(theme.palette.warning.main, 0.03),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: c.avatarColor || '#d97706',
                          color: '#fff',
                          fontWeight: 700,
                          width: 38,
                          height: 38,
                          fontSize: '0.9rem',
                        }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.phone}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 800 }}>
                          {formatCurrency(c.totalDue, currency)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => onOpenTransactionModal('PAYMENT_RECEIVED', c.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: 1.5,
                          fontSize: '0.75rem',
                          py: 0.4,
                        }}
                      >
                        Collect
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Recent Transactions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recent Activity
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest sales, payments, and expenses
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ChevronRight />}
                onClick={onViewAllTransactions}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Full Ledger
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {recentTransactions.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No recent business transactions found.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                {recentTransactions.slice(0, 5).map((tx) => {
                  const isExpense = tx.type === 'EXPENSE';
                  const isPayment = tx.type === 'PAYMENT_RECEIVED';
                  const isCredit = tx.type === 'CREDIT_SALE';

                  return (
                    <Paper
                      key={tx.id}
                      variant="outlined"
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: isExpense
                              ? alpha(theme.palette.error.main, 0.1)
                              : isPayment
                              ? alpha(theme.palette.info.main, 0.1)
                              : isCredit
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(theme.palette.success.main, 0.1),
                            color: isExpense
                              ? theme.palette.error.main
                              : isPayment
                              ? theme.palette.info.main
                              : isCredit
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                          }}
                        >
                          {isExpense ? (
                            <TrendingDown fontSize="small" />
                          ) : isPayment ? (
                            <PriceCheck fontSize="small" />
                          ) : isCredit ? (
                            <ReceiptLong fontSize="small" />
                          ) : (
                            <AddShoppingCart fontSize="small" />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {tx.customerName || (isExpense ? 'Operating Expense' : 'Sale')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tx.date} • {tx.paymentMethod}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          color={
                            isExpense
                              ? 'error.main'
                              : isCredit && tx.paidAmount === 0
                              ? 'warning.main'
                              : 'success.main'
                          }
                          sx={{ fontWeight: 700 }}
                        >
                          {isExpense ? '-' : isCredit && tx.paidAmount === 0 ? '' : '+'}
                          {formatCurrency(
                            isCredit ? tx.totalAmount : tx.paidAmount !== undefined ? tx.paidAmount : tx.totalAmount,
                            currency
                          )}
                        </Typography>
                        {tx.dueAmount > 0 ? (
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600, display: 'block' }}>
                            {tx.paidAmount > 0 ? `Paid: ${currency.symbol}${tx.paidAmount} • ` : ''}Due: {formatCurrency(tx.dueAmount, currency)}
                          </Typography>
                        ) : isPayment ? (
                          <Typography variant="caption" color="info.main" sx={{ fontWeight: 600, display: 'block' }}>
                            Due Collected
                          </Typography>
                        ) : null}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
