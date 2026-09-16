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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search,
  FileDownload,
  Edit,
  DeleteOutlined,
  ShoppingCart,
  ReceiptLong,
  PriceCheck,
  TrendingDown,
} from '@mui/icons-material';
import { BusinessTransaction, CurrencyConfig, BusinessTransactionType } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { triggerDownload } from '../../utils/storage';

interface BusinessLedgerTableProps {
  transactions: BusinessTransaction[];
  currency: CurrencyConfig;
  onEditTransaction: (tx: BusinessTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNewTransaction: (type?: BusinessTransactionType) => void;
}

export const BusinessLedgerTable: React.FC<BusinessLedgerTableProps> = ({
  transactions,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onNewTransaction,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) {
        return false;
      }

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchCustomer = tx.customerName?.toLowerCase().includes(term);
      const matchDesc = tx.description?.toLowerCase().includes(term);
      const matchRef = tx.reference?.toLowerCase().includes(term);
      const matchMethod = tx.paymentMethod?.toLowerCase().includes(term);
      return matchCustomer || matchDesc || matchRef || matchMethod;
    });
  }, [transactions, typeFilter, searchTerm]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredTransactions, page, rowsPerPage]);

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Type',
      'Customer',
      'Description',
      'Reference',
      'Payment Method',
      'Total Amount',
      'Paid Amount',
      'Due Amount',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type,
      tx.customerName || 'N/A',
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.reference || '',
      tx.paymentMethod,
      tx.totalAmount.toString(),
      tx.paidAmount.toString(),
      tx.dueAmount.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `business_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const getTypeChip = (type: BusinessTransactionType) => {
    switch (type) {
      case 'SALE':
        return (
          <Chip
            icon={<ShoppingCart sx={{ fontSize: '15px !important' }} />}
            label="Cash Sale"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'CREDIT_SALE':
        return (
          <Chip
            icon={<ReceiptLong sx={{ fontSize: '15px !important' }} />}
            label="Credit Sale"
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'PAYMENT_RECEIVED':
        return (
          <Chip
            icon={<PriceCheck sx={{ fontSize: '15px !important' }} />}
            label="Due Collected"
            color="info"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'EXPENSE':
        return (
          <Chip
            icon={<TrendingDown sx={{ fontSize: '15px !important' }} />}
            label="Expense"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  const txToDelete = transactions.find((t) => t.id === deleteId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Controls Bar */}
        <Box
          sx={{
            p: { xs: 1.75, sm: 2.5 },
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', width: { xs: '100%', md: 'auto' }, flexGrow: 1 }}>
            <TextField
              size="small"
              placeholder="Search customer, memo, items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />

            <ToggleButtonGroup
              value={typeFilter}
              exclusive
              onChange={(_, val) => val && setTypeFilter(val)}
              size="small"
              sx={{
                overflowX: 'auto',
                maxWidth: '100%',
                py: 0.5,
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.6,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <ToggleButton value="ALL">All ({transactions.length})</ToggleButton>
              <ToggleButton value="SALE">Cash Sales</ToggleButton>
              <ToggleButton value="CREDIT_SALE">Credit / Due</ToggleButton>
              <ToggleButton value="PAYMENT_RECEIVED">Due Collections</ToggleButton>
              <ToggleButton value="EXPENSE">Expenses</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, '& > button': { flex: { xs: 1, sm: 'none' } } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownload />}
              onClick={handleExportCsv}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<ShoppingCart />}
              onClick={() => onNewTransaction('SALE')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              New Entry
            </Button>
          </Box>
        </Box>

        {/* Table Content */}
        <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer / Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total Bill
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Paid Amount
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Due Left
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <ReceiptLong sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {transactions.length === 0
                        ? 'No transactions recorded yet.'
                        : 'No transactions match your search/filter.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {tx.date}
                    </TableCell>

                    <TableCell>{getTypeChip(tx.type)}</TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {tx.customerName || (tx.type === 'EXPENSE' ? 'Operating Expense' : 'Walk-in')}
                        </Typography>
                        {tx.description && (
                          <Typography variant="caption" color="text.secondary">
                            {tx.description}
                          </Typography>
                        )}
                        {tx.reference && (
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                            Ref: {tx.reference}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={tx.paymentMethod}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                      />
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={tx.type === 'EXPENSE' ? 'error.main' : 'text.primary'}
                        sx={{ fontWeight: 700 }}
                      >
                        {tx.type === 'EXPENSE' ? '-' : ''}
                        {formatCurrency(tx.totalAmount, currency)}
                      </Typography>
                    </TableCell>

                    {/* Paid Amount */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={
                          tx.type === 'EXPENSE'
                            ? 'text.secondary'
                            : 'success.main'
                        }
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(tx.paidAmount, currency)}
                      </Typography>
                    </TableCell>

                    {/* Due Amount */}
                    <TableCell align="right">
                      {tx.dueAmount > 0 ? (
                        <Chip
                          label={formatCurrency(tx.dueAmount, currency)}
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Edit Transaction">
                          <IconButton
                            size="small"
                            onClick={() => onEditTransaction(tx)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Transaction">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(tx.id)}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Transaction?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction of{' '}
            <strong>
              {txToDelete ? formatCurrency(txToDelete.totalAmount, currency) : ''}
            </strong>
            ? This will immediately recalculate your sales and customer dues.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteId) {
                onDeleteTransaction(deleteId);
                setDeleteId(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
