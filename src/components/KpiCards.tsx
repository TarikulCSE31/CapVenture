import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  TrendingUp,
  SavingsOutlined,
  CheckCircleOutlined,
  HourglassEmpty,
} from '@mui/icons-material';
import { CurrencyConfig, FinancialSummary } from '../types';
import { formatCurrency } from '../utils/calculations';

interface KpiCardsProps {
  summary: FinancialSummary;
  currency: CurrencyConfig;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, currency }) => {
  const theme = useTheme();
  const returnRate = summary.totalInvested > 0 
    ? (summary.totalPrincipalReturned / summary.totalInvested) * 100 
    : 0;

  return (
    <Grid container spacing={2.5}>
      
      {/* 1. Active Capital Deployed (Principal) */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                Active Capital Out
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.1)',
                  color: 'warning.main',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                }}
              >
                <AccountBalanceWalletOutlined fontSize="small" />
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatCurrency(summary.activeCapital, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Principal currently with partner
            </Typography>

            <Box sx={{ mt: 2.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Principal Repaid</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{returnRate.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, returnRate))}
                color="warning"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Total Profit Realized */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="success.main" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                Total Profit Realized
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
                  color: 'success.main',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                }}
              >
                <TrendingUp fontSize="small" />
              </Avatar>
            </Box>

            <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, mb: 0.5 }}>
              +{formatCurrency(summary.totalProfitRealized, currency)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={`+${summary.roiPercentage.toFixed(1)}% ROI`}
                size="small"
                color="success"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                return on investment
              </Typography>
            </Box>

            <Box sx={{ mt: 2.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Expected Target</Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                {summary.totalExpectedProfit > 0 ? `+${formatCurrency(summary.totalExpectedProfit, currency)}` : 'Pure Yield'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 3. Net Cash Flow (Break-Even Status) */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                Net Cash Position
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: summary.netCashFlow >= 0 
                    ? (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)')
                    : (theme.palette.mode === 'dark' ? 'rgba(2, 136, 209, 0.15)' : 'rgba(2, 136, 209, 0.1)'),
                  color: summary.netCashFlow >= 0 ? 'success.main' : 'info.main',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                }}
              >
                {summary.netCashFlow >= 0 ? <CheckCircleOutlined fontSize="small" /> : <HourglassEmpty fontSize="small" />}
              </Avatar>
            </Box>

            <Typography
              variant="h5"
              color={summary.netCashFlow >= 0 ? 'success.main' : 'text.primary'}
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              {summary.netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(summary.netCashFlow, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {summary.netCashFlow >= 0 
                ? '100% of capital recovered (Profit zone)' 
                : `${formatCurrency(Math.abs(summary.netCashFlow), currency)} to reach break-even`}
            </Typography>

            <Box sx={{ mt: 2.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Capital Recovery</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{summary.recoveryPercentage.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, summary.recoveryPercentage))}
                color={summary.netCashFlow >= 0 ? 'success' : 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 4. Total Capital Injected */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
                Total Invested
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                }}
              >
                <SavingsOutlined fontSize="small" />
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {formatCurrency(summary.totalInvested, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Cumulative funds committed to date
            </Typography>

            <Box sx={{ mt: 2.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Principal Repaid</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {formatCurrency(summary.totalPrincipalReturned, currency)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
};
