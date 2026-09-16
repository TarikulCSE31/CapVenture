import React, { useMemo } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  BarChart as BarChartIcon,
  Timeline,
} from '@mui/icons-material';
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
  const theme = useTheme();
  const timelineData = useMemo(() => generateCumulativeTimeline(transactions), [transactions]);
  const monthlyData = useMemo(() => generateMonthlyData(transactions), [transactions]);

  const avgMonthlyProfit = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const totalProf = monthlyData.reduce((acc, curr) => acc + curr.profit, 0);
    return totalProf / monthlyData.length;
  }, [monthlyData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Top Analytical Cards */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Break-Even Recovery
              </Typography>
              <Timeline fontSize="small" color="primary" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {summary.recoveryPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color={summary.isBreakEvenReached ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                {summary.isBreakEvenReached ? 'Fully Recovered' : 'In Progress'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, summary.recoveryPercentage))}
              color={summary.isBreakEvenReached ? 'success' : 'primary'}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Total returns + profit: {formatCurrency(summary.totalPrincipalReturned + summary.totalProfitRealized, currency)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Monthly Profit Rate
              </Typography>
              <TrendingUp fontSize="small" color="success" />
            </Box>
            <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, mb: 0.5 }}>
              +{formatCurrency(avgMonthlyProfit, currency)}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                / month avg
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Averaged over {monthlyData.length} recorded active month{monthlyData.length !== 1 ? 's' : ''}.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Total Return On Investment
              </Typography>
              <BarChartIcon fontSize="small" color="info" />
            </Box>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
              {summary.roiPercentage.toFixed(1)}% ROI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Profit earned on {formatCurrency(summary.totalInvested, currency)} cumulative capital.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart 1: Cumulative Trajectory */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Capital Out vs. Cumulative Profit Over Time
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Visualizes active principal vs total realized earnings
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 300 }}>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currency.symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: theme.palette.text.primary,
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
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrincipal)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="cumulativeProfit"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">
                Record transactions to generate timeline charts
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Chart 2: Monthly Breakdown */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Monthly Cash Flow & Profit Volume
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Monthly comparison of capital advances, repayments, and profit distributions
          </Typography>
        </Box>

        <Box sx={{ width: '100%', height: 300 }}>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${currency.symbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: theme.palette.text.primary,
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
                  wrapperStyle={{ fontSize: '12px', color: theme.palette.text.secondary }}
                />
                <Bar dataKey="invested" name="Capital Invested" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" name="Principal Returned" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit Earned" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">
                No monthly activity to display yet
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

    </Box>
  );
};
