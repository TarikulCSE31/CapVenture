import React, { useState, useMemo } from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FileDownload,
  Edit,
  DeleteOutlined,
  Add,
  CallMade,
  CallReceived,
  TrendingUp,
  Loop,
} from '@mui/icons-material';
import { CurrencyConfig, Transaction, TransactionType, TransactionWithRunningBalance } from '../types';
import { formatCurrency } from '../utils/calculations';

interface LedgerTableProps {
  transactionsWithBalance: TransactionWithRunningBalance[];
  currency: CurrencyConfig;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
  onOpenAddModal: () => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactionsWithBalance,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onExportCsv,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered list
  const filtered = useMemo(() => {
    return transactionsWithBalance.filter((t) => {
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const partnerMatch = (t.partnerName || '').toLowerCase().includes(term);
      const descMatch = (t.description || '').toLowerCase().includes(term);
      const refMatch = (t.reference || '').toLowerCase().includes(term);
      const amtMatch = t.amount.toString().includes(term);
      return partnerMatch || descMatch || refMatch || amtMatch;
    });
  }, [transactionsWithBalance, typeFilter, searchTerm]);

  const pagedTransactions = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const getTypeChip = (type: TransactionType) => {
    switch (type) {
      case 'INVESTMENT_OUT':
        return (
          <Chip
            icon={<CallMade style={{ fontSize: 13 }} />}
            label="Capital Out"
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      case 'PRINCIPAL_RETURN':
        return (
          <Chip
            icon={<CallReceived style={{ fontSize: 13 }} />}
            label="Principal Back"
            size="small"
            color="warning"
            variant="outlined"
          />
        );
      case 'PROFIT_PAYOUT':
        return (
          <Chip
            icon={<TrendingUp style={{ fontSize: 13 }} />}
            label="Profit Share"
            size="small"
            color="success"
            variant="outlined"
          />
        );
      case 'REINVEST':
        return (
          <Chip
            icon={<Loop style={{ fontSize: 13 }} />}
            label="Reinvested"
            size="small"
            color="secondary"
            variant="outlined"
          />
        );
    }
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      
      {/* Header Controls */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
        
        {/* Left: Search & Filter Tabs */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, flex: 1 }}>
          <TextField
            placeholder="Search memo, partner, reference..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: { sm: 280 } }}
          />

          <ToggleButtonGroup
            value={typeFilter}
            exclusive
            onChange={(_, val) => {
              if (val) {
                setTypeFilter(val);
                setPage(0);
              }
            }}
            size="small"
            sx={{ overflowX: 'auto' }}
          >
            <ToggleButton value="ALL" sx={{ px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
              All ({transactionsWithBalance.length})
            </ToggleButton>
            <ToggleButton value="INVESTMENT_OUT" sx={{ px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Invest Out
            </ToggleButton>
            <ToggleButton value="PRINCIPAL_RETURN" sx={{ px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Principal Back
            </ToggleButton>
            <ToggleButton value="PROFIT_PAYOUT" sx={{ px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Profit
            </ToggleButton>
            <ToggleButton value="REINVEST" sx={{ px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
              Reinvest
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Right: Export CSV & Add Button */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FileDownload />}
            onClick={onExportCsv}
            size="small"
            sx={{ fontSize: '0.8125rem' }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onOpenAddModal}
            size="small"
            sx={{ fontSize: '0.8125rem' }}
          >
            Add Record
          </Button>
        </Box>

      </Box>

      {/* Material Table */}
      <TableContainer>
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Description & Reference</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Running Principal</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions match your current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedTransactions.map((t) => {
                const isReturn = t.type === 'PRINCIPAL_RETURN';
                const isProfit = t.type === 'PROFIT_PAYOUT';
                const isReinvest = t.type === 'REINVEST';

                return (
                  <TableRow key={t.id} hover>
                    {/* Date */}
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {new Date(t.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>

                    {/* Category Type */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {getTypeChip(t.type)}
                    </TableCell>

                    {/* Partner Name */}
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {t.partnerName}
                    </TableCell>

                    {/* Description & Reference */}
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }} noWrap>
                        {t.description || '—'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {t.paymentMethod && (
                          <Typography variant="caption" color="text.secondary">
                            via {t.paymentMethod}
                          </Typography>
                        )}
                        {t.reference && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            #{t.reference}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: isProfit || isReinvest ? 'success.main' : isReturn ? 'warning.main' : 'primary.main',
                        }}
                      >
                        {isProfit ? '+' : ''}
                        {formatCurrency(t.amount, currency)}
                      </Typography>
                    </TableCell>

                    {/* Running Principal */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatCurrency(t.runningPrincipal, currency)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEditTransaction(t)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (confirm(`Delete transaction of ${formatCurrency(t.amount, currency)}?`)) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

    </Paper>
  );
};
