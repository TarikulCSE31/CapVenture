import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TableContainer,
} from '@mui/material';
import {
  Print,
  ReceiptLong,
} from '@mui/icons-material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Top Action Bar (Hidden when printing) */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}
        className="no-print"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReceiptLong color="primary" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Partner Statement of Account
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Generate settlement statements ready to print or export as PDF
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={partner?.id || 'ALL'}
              onChange={(e) => onSelectPartner(e.target.value)}
              sx={{ fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Consolidated Records</option>
              <MenuItem value="ALL">All Consolidated Records</MenuItem>
              {allPartners.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Print />}
            onClick={handlePrint}
            size="small"
          >
            Print / Save PDF
          </Button>
        </Box>
      </Paper>

      {/* Printable Statement Document */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          backgroundColor: 'background.paper',
        }}
      >
        {/* Document Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', pb: 3, mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
              Official Settlement of Accounts
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              CAPITAL & PROFIT STATEMENT
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Date: <strong>{currentDate}</strong>
            </Typography>
          </Box>

          <Box sx={{ mt: { xs: 2, sm: 0 }, textAlign: { sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary">Account Holder:</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {partner ? partner.name : 'Consolidated Portfolio'}
            </Typography>
            {partner?.phone && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Phone: {partner.phone}
              </Typography>
            )}
            {partner?.email && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Email: {partner.email}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Summary Metric Row */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Total Advanced</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                {formatCurrency(summary.totalInvested, currency)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>Principal Repaid</Typography>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                {formatCurrency(summary.totalPrincipalReturned, currency)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>Profit Distributed</Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, mt: 0.5 }}>
                +{formatCurrency(summary.totalProfitRealized, currency)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>Current Balance Owed</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatCurrency(summary.activeCapital, currency)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Notes if present */}
        {partner?.notes && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover', borderLeft: 3, borderColor: 'primary.main' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
              AGREEMENT MEMO / TERMS:
            </Typography>
            <Typography variant="body2">{partner.notes}</Typography>
          </Box>
        )}

        {/* Itemized Table */}
        <TableContainer sx={{ mb: 6 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description / Reference</TableCell>
                <TableCell align="right">Capital Invested</TableCell>
                <TableCell align="right">Principal Repaid</TableCell>
                <TableCell align="right">Profit Paid</TableCell>
                <TableCell align="right">Principal Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...transactionsWithBalance].reverse().map((t) => {
                const isInvest = t.type === 'INVESTMENT_OUT';
                const isReturn = t.type === 'PRINCIPAL_RETURN';
                const isProfit = t.type === 'PROFIT_PAYOUT';
                const isReinvest = t.type === 'REINVEST';

                return (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{t.date}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {isInvest && <Typography component="span" variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>Capital Advance</Typography>}
                      {isReturn && <Typography component="span" variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>Principal Return</Typography>}
                      {isProfit && <Typography component="span" variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Profit Payout</Typography>}
                      {isReinvest && <Typography component="span" variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>Reinvestment</Typography>}
                    </TableCell>
                    <TableCell>
                      {t.description}
                      {t.reference && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>({t.reference})</Typography>}
                    </TableCell>
                    <TableCell align="right">
                      {isInvest || isReinvest ? formatCurrency(t.amount, currency) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {isReturn ? formatCurrency(t.amount, currency) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {isProfit || isReinvest ? formatCurrency(t.amount, currency) : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {formatCurrency(t.runningPrincipal, currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Closing Outstanding Balance Owed:
                </TableCell>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 800, fontSize: '1rem', color: 'primary.main', fontFamily: 'monospace' }}>
                  {formatCurrency(summary.activeCapital, currency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Signature Blocks */}
        <Grid container spacing={6} sx={{ pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'text.secondary', pb: 6, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Investor Signature & Date</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'text.secondary', pb: 6, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Partner / Borrower Signature & Date</Typography>
          </Grid>
        </Grid>

      </Paper>
    </Box>
  );
};
