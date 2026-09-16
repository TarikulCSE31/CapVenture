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
  alpha,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  TrendingUp,
  SavingsOutlined,
  CheckCircleOutlined,
  HourglassEmpty,
  PaidOutlined,
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

  const collectedExpected = Math.max(0, summary.totalExpectedProfit - summary.pendingExpectedProfit);
  const targetFulfillmentRate = summary.totalExpectedProfit > 0
    ? (collectedExpected / summary.totalExpectedProfit) * 100
    : 0;

  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} columns={{ xs: 12, sm: 12, md: 12, lg: 10 }}>
      
      {/* 1. Active Capital Deployed (Principal) */}
      <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, '&:last-child': { pb: { xs: 1.75, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                Active Capital Out
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  color: 'warning.main',
                  width: { xs: 30, sm: 36 },
                  height: { xs: 30, sm: 36 },
                  borderRadius: 2,
                }}
              >
                <AccountBalanceWalletOutlined sx={{ fontSize: { xs: 17, sm: 20 } }} />
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' }, wordBreak: 'break-word' }}>
              {formatCurrency(summary.activeCapital, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Principal currently with partner
            </Typography>

            <Box sx={{ mt: { xs: 1.5, sm: 2.5 }, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Repaid</Typography>
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
      <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, '&:last-child': { pb: { xs: 1.75, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="success.main" sx={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                Total Profit
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  color: 'success.main',
                  width: { xs: 30, sm: 36 },
                  height: { xs: 30, sm: 36 },
                  borderRadius: 2,
                }}
              >
                <TrendingUp sx={{ fontSize: { xs: 17, sm: 20 } }} />
              </Avatar>
            </Box>

            <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' }, wordBreak: 'break-word' }}>
              +{formatCurrency(summary.totalProfitRealized, currency)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={`+${summary.roiPercentage.toFixed(1)}% ROI`}
                size="small"
                color="success"
                sx={{ height: 20, fontSize: '0.68rem' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                return
              </Typography>
            </Box>

            <Box sx={{ mt: { xs: 1.5, sm: 2.5 }, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Target</Typography>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                {summary.totalExpectedProfit > 0 ? `+${formatCurrency(summary.totalExpectedProfit, currency)}` : 'Pure Yield'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 3. Expected Remaining Profit to Earn */}
      <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, '&:last-child': { pb: { xs: 1.75, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="info.main" sx={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                Remaining Profit
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                  color: 'info.main',
                  width: { xs: 30, sm: 36 },
                  height: { xs: 30, sm: 36 },
                  borderRadius: 2,
                }}
              >
                <PaidOutlined sx={{ fontSize: { xs: 17, sm: 20 } }} />
              </Avatar>
            </Box>

            <Typography variant="h5" color="info.main" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' }, wordBreak: 'break-word' }}>
              +{formatCurrency(summary.pendingExpectedProfit, currency)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={summary.pendingExpectedProfit > 0 ? 'Pending' : 'Cleared'}
                size="small"
                color={summary.pendingExpectedProfit > 0 ? 'info' : 'default'}
                variant={summary.pendingExpectedProfit > 0 ? 'filled' : 'outlined'}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ mt: { xs: 1.5, sm: 2.5 }, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Collected</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {summary.totalExpectedProfit > 0 ? `${targetFulfillmentRate.toFixed(0)}%` : '—'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, targetFulfillmentRate))}
                color="info"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 4. Net Cash Flow (Break-Even Status) */}
      <Grid size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, '&:last-child': { pb: { xs: 1.75, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                Net Cash
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: summary.netCashFlow >= 0 
                    ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.1)
                    : alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  color: summary.netCashFlow >= 0 ? 'success.main' : 'info.main',
                  width: { xs: 30, sm: 36 },
                  height: { xs: 30, sm: 36 },
                  borderRadius: 2,
                }}
              >
                {summary.netCashFlow >= 0 ? <CheckCircleOutlined sx={{ fontSize: { xs: 17, sm: 20 } }} /> : <HourglassEmpty sx={{ fontSize: { xs: 17, sm: 20 } }} />}
              </Avatar>
            </Box>

            <Typography
              variant="h5"
              color={summary.netCashFlow >= 0 ? 'success.main' : 'text.primary'}
              sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' }, wordBreak: 'break-word' }}
            >
              {summary.netCashFlow >= 0 ? '+' : ''}
              {formatCurrency(summary.netCashFlow, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {summary.netCashFlow >= 0 
                ? '100% of capital recovered' 
                : `${formatCurrency(Math.abs(summary.netCashFlow), currency)} to break-even`}
            </Typography>

            <Box sx={{ mt: { xs: 1.5, sm: 2.5 }, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Recovery</Typography>
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

      {/* 5. Total Capital Injected */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.75, sm: 2.5 }, '&:last-child': { pb: { xs: 1.75, sm: 2.5 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                Total Invested
              </Typography>
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                  color: 'primary.main',
                  width: { xs: 30, sm: 36 },
                  height: { xs: 30, sm: 36 },
                  borderRadius: 2,
                }}
              >
                <SavingsOutlined sx={{ fontSize: { xs: 17, sm: 20 } }} />
              </Avatar>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' }, wordBreak: 'break-word' }}>
              {formatCurrency(summary.totalInvested, currency)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Cumulative funds committed
            </Typography>

            <Box sx={{ mt: { xs: 1.5, sm: 2.5 }, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Repaid</Typography>
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
