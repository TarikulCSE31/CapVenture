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
  TableSortLabel,
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  useTheme,
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
  FilterList,
  Close,
} from '@mui/icons-material';
import { CurrencyConfig, Partner, Transaction, TransactionType, TransactionWithRunningBalance } from '../types';
import { formatCurrency } from '../utils/calculations';
import { exportToCsv, triggerDownload } from '../utils/storage';

type SortableField = 'date' | 'type' | 'partnerName' | 'amount' | 'runningPrincipal';
type DateFilterType = 'ALL' | 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR';

interface LedgerTableProps {
  transactionsWithBalance: TransactionWithRunningBalance[];
  currency: CurrencyConfig;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteMultipleTransactions?: (ids: string[]) => void;
  onExportCsv: () => void;
  onOpenAddModal: () => void;
  partners?: Partner[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactionsWithBalance,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteMultipleTransactions,
  onExportCsv,
  onOpenAddModal,
  partners = [],
}) => {
  const theme = useTheme();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('ALL');

  // Sorting states
  const [orderBy, setOrderBy] = useState<SortableField>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Multi-selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Confirmation Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  // Filter Menu anchor
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

  // Handle Sorting request
  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 1. Filtered records
  const filtered = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearKey = `${now.getFullYear()}`;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return transactionsWithBalance.filter((t) => {
      // Type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

      // Date range filter
      if (dateFilter === 'THIS_MONTH' && !t.date.startsWith(currentMonthKey)) return false;
      if (dateFilter === 'THIS_YEAR' && !t.date.startsWith(currentYearKey)) return false;
      if (dateFilter === 'LAST_30') {
        const txDate = new Date(t.date);
        if (txDate < thirtyDaysAgo || txDate > now) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const partnerMatch = (t.partnerName || '').toLowerCase().includes(term);
      const descMatch = (t.description || '').toLowerCase().includes(term);
      const refMatch = (t.reference || '').toLowerCase().includes(term);
      const amtMatch = t.amount.toString().includes(term);
      return partnerMatch || descMatch || refMatch || amtMatch;
    });
  }, [transactionsWithBalance, typeFilter, dateFilter, searchTerm]);

  // 2. Sorted records
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (orderBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'runningPrincipal':
          comparison = a.runningPrincipal - b.runningPrincipal;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'partnerName':
          comparison = (a.partnerName || '').localeCompare(b.partnerName || '');
          break;
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filtered, orderBy, order]);

  // 3. Paged records
  const pagedTransactions = useMemo(() => {
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  // Selection calculations
  const currentPageIds = useMemo(() => pagedTransactions.map((t) => t.id), [pagedTransactions]);
  const isAllCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const isSomeCurrentPageSelected = currentPageIds.some((id) => selectedIds.includes(id));
  const isAllFilteredSelected = filtered.length > 0 && filtered.every((t) => selectedIds.includes(t.id));

  // Toggle select on current page
  const handleToggleSelectCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Select all filtered across all pages
  const handleSelectAllFiltered = () => {
    setSelectedIds(filtered.map((t) => t.id));
  };

  // Toggle single row selection
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Clear all selection
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Selected totals
  const selectedTransactions = useMemo(() => {
    const idSet = new Set(selectedIds);
    return transactionsWithBalance.filter((t) => idSet.has(t.id));
  }, [transactionsWithBalance, selectedIds]);

  const selectedTotalAmount = useMemo(() => {
    return selectedTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [selectedTransactions]);

  // Filtered view summary totals
  const viewTotals = useMemo(() => {
    let invested = 0;
    let returned = 0;
    let profit = 0;
    let expectedProfit = 0;
    for (const t of filtered) {
      if (t.type === 'INVESTMENT_OUT') {
        invested += t.amount;
        if (t.expectedProfit) expectedProfit += t.expectedProfit;
      } else if (t.type === 'PRINCIPAL_RETURN') {
        returned += t.amount;
      } else if (t.type === 'PROFIT_PAYOUT') {
        profit += t.amount;
      } else if (t.type === 'REINVEST') {
        invested += t.amount;
        profit += t.amount;
      }
    }
    return { invested, returned, profit, expectedProfit };
  }, [filtered]);

  // Trigger Bulk Deletion
  const handleTriggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setItemsToDelete(selectedIds);
    setConfirmDialogOpen(true);
  };

  // Trigger Single Deletion
  const handleTriggerSingleDelete = (id: string) => {
    setItemsToDelete([id]);
    setConfirmDialogOpen(true);
  };

  // Confirm delete execution
  const handleConfirmDelete = () => {
    if (itemsToDelete.length === 1) {
      onDeleteTransaction(itemsToDelete[0]);
    } else if (itemsToDelete.length > 1) {
      if (onDeleteMultipleTransactions) {
        onDeleteMultipleTransactions(itemsToDelete);
      } else {
        itemsToDelete.forEach((id) => onDeleteTransaction(id));
      }
    }
    setSelectedIds((prev) => prev.filter((id) => !itemsToDelete.includes(id)));
    setConfirmDialogOpen(false);
    setItemsToDelete([]);
  };

  // Export selected to CSV
  const handleExportSelectedCsv = () => {
    if (selectedTransactions.length === 0) return;
    const csv = exportToCsv(selectedTransactions, partners);
    const filename = `selected-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
  };

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
      
      {/* BULK ACTIONS TOOLBAR (When rows are selected) */}
      {selectedIds.length > 0 ? (
        <Box
          sx={{
            p: 2,
            px: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : 'rgba(25, 118, 210, 0.08)',
            borderBottom: `1px solid ${theme.palette.primary.main}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Checkbox
              size="small"
              indeterminate={isSomeCurrentPageSelected && !isAllCurrentPageSelected}
              checked={isAllCurrentPageSelected}
              onChange={handleToggleSelectCurrentPage}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
            </Typography>
            <Chip
              size="small"
              color="primary"
              label={`Sum: ${formatCurrency(selectedTotalAmount, currency)}`}
              sx={{ fontWeight: 600 }}
            />
            {!isAllFilteredSelected && filtered.length > currentPageIds.length && (
              <Button size="small" onClick={handleSelectAllFiltered} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Select all {filtered.length} matching
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteOutlined />}
              onClick={handleTriggerBulkDelete}
              sx={{ fontWeight: 600 }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<FileDownload />}
              onClick={handleExportSelectedCsv}
            >
              Export Selected
            </Button>
            <IconButton size="small" onClick={handleClearSelection} title="Clear selection">
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        /* STANDARD HEADER CONTROLS (Search & Filters) */
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          {/* Left: Search & Category Toggle */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
              alignItems: { xs: 'stretch', sm: 'center' },
              flex: 1,
            }}
          >
            <TextField
              placeholder="Search memo, partner, reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: { sm: 240 }, maxWidth: { md: 280 } }}
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
              <ToggleButton value="INVESTMENT_OUT" sx={{ px: 1.2, fontSize: '0.75rem', fontWeight: 600 }}>
                Invest
              </ToggleButton>
              <ToggleButton value="PRINCIPAL_RETURN" sx={{ px: 1.2, fontSize: '0.75rem', fontWeight: 600 }}>
                Returned
              </ToggleButton>
              <ToggleButton value="PROFIT_PAYOUT" sx={{ px: 1.2, fontSize: '0.75rem', fontWeight: 600 }}>
                Profit
              </ToggleButton>
              <ToggleButton value="REINVEST" sx={{ px: 1.2, fontSize: '0.75rem', fontWeight: 600 }}>
                Reinvest
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Quick Date Filter Dropdown */}
            <Button
              size="small"
              variant={dateFilter !== 'ALL' ? 'contained' : 'outlined'}
              color={dateFilter !== 'ALL' ? 'primary' : 'inherit'}
              startIcon={<FilterList fontSize="small" />}
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {dateFilter === 'ALL'
                ? 'Date: All Time'
                : dateFilter === 'THIS_MONTH'
                ? 'Date: This Month'
                : dateFilter === 'LAST_30'
                ? 'Date: Last 30 Days'
                : 'Date: This Year'}
            </Button>
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={() => setFilterMenuAnchor(null)}
            >
              <MenuItem
                selected={dateFilter === 'ALL'}
                onClick={() => {
                  setDateFilter('ALL');
                  setFilterMenuAnchor(null);
                  setPage(0);
                }}
              >
                All Time
              </MenuItem>
              <MenuItem
                selected={dateFilter === 'THIS_MONTH'}
                onClick={() => {
                  setDateFilter('THIS_MONTH');
                  setFilterMenuAnchor(null);
                  setPage(0);
                }}
              >
                This Month
              </MenuItem>
              <MenuItem
                selected={dateFilter === 'LAST_30'}
                onClick={() => {
                  setDateFilter('LAST_30');
                  setFilterMenuAnchor(null);
                  setPage(0);
                }}
              >
                Last 30 Days
              </MenuItem>
              <MenuItem
                selected={dateFilter === 'THIS_YEAR'}
                onClick={() => {
                  setDateFilter('THIS_YEAR');
                  setFilterMenuAnchor(null);
                  setPage(0);
                }}
              >
                This Year
              </MenuItem>
            </Menu>
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
              sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
            >
              Add Record
            </Button>
          </Box>
        </Box>
      )}

      {/* Material Table */}
      <TableContainer>
        <Table sx={{ minWidth: 720 }} size="small">
          <TableHead>
            <TableRow>
              {/* Checkbox Column */}
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  indeterminate={isSomeCurrentPageSelected && !isAllCurrentPageSelected}
                  checked={isAllCurrentPageSelected}
                  onChange={handleToggleSelectCurrentPage}
                />
              </TableCell>

              {/* Date */}
              <TableCell sortDirection={orderBy === 'date' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleRequestSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>

              {/* Category */}
              <TableCell sortDirection={orderBy === 'type' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Category
                </TableSortLabel>
              </TableCell>

              {/* Partner */}
              <TableCell sortDirection={orderBy === 'partnerName' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'partnerName'}
                  direction={orderBy === 'partnerName' ? order : 'asc'}
                  onClick={() => handleRequestSort('partnerName')}
                >
                  Partner
                </TableSortLabel>
              </TableCell>

              {/* Description & Reference */}
              <TableCell>Description & Reference</TableCell>

              {/* Amount */}
              <TableCell align="right" sortDirection={orderBy === 'amount' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleRequestSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>

              {/* Running Principal */}
              <TableCell align="right" sortDirection={orderBy === 'runningPrincipal' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'runningPrincipal'}
                  direction={orderBy === 'runningPrincipal' ? order : 'asc'}
                  onClick={() => handleRequestSort('runningPrincipal')}
                >
                  Principal Bal.
                </TableSortLabel>
              </TableCell>

              {/* Actions */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions match your current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedTransactions.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                const isReturn = t.type === 'PRINCIPAL_RETURN';
                const isProfit = t.type === 'PROFIT_PAYOUT';
                const isReinvest = t.type === 'REINVEST';

                return (
                  <TableRow
                    key={t.id}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(25, 118, 210, 0.12) !important'
                          : 'rgba(25, 118, 210, 0.06) !important'
                        : undefined,
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => handleToggleRow(t.id)}
                      />
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }} onClick={() => handleToggleRow(t.id)}>
                      {new Date(t.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>

                    {/* Category Type */}
                    <TableCell sx={{ whiteSpace: 'nowrap' }} onClick={() => handleToggleRow(t.id)}>
                      {getTypeChip(t.type)}
                    </TableCell>

                    {/* Partner Name */}
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }} onClick={() => handleToggleRow(t.id)}>
                      {t.partnerName}
                    </TableCell>

                    {/* Description & Reference */}
                    <TableCell sx={{ maxWidth: 280 }} onClick={() => handleToggleRow(t.id)}>
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
                      {t.targetDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6875rem', fontStyle: 'italic', mt: 0.2 }}>
                          Target Return: {t.targetDate}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={() => handleToggleRow(t.id)}>
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
                      {t.type === 'INVESTMENT_OUT' && t.expectedProfit !== undefined && t.expectedProfit > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: 'success.main',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            lineHeight: 1.2,
                            mt: 0.3,
                          }}
                        >
                          Target: +{formatCurrency(t.expectedProfit, currency)}
                          {t.expectedProfitRate ? ` (${t.expectedProfitRate}%)` : ''}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Running Principal */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: 600 }} onClick={() => handleToggleRow(t.id)}>
                      {formatCurrency(t.runningPrincipal, currency)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEditTransaction(t)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleTriggerSingleDelete(t.id)}
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

      {/* FILTERED SUMMARY SUBHEADER */}
      <Box
        sx={{
          p: 1.5,
          px: 2.5,
          bgcolor: 'action.hover',
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Showing <strong>{sorted.length}</strong> transaction{sorted.length === 1 ? '' : 's'}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Capital Out: <strong style={{ color: theme.palette.primary.main }}>{formatCurrency(viewTotals.invested, currency)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Returned: <strong style={{ color: theme.palette.warning.main }}>{formatCurrency(viewTotals.returned, currency)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Profit: <strong style={{ color: theme.palette.success.main }}>{formatCurrency(viewTotals.profit, currency)}</strong>
          </Typography>
          {viewTotals.expectedProfit > 0 && (
            <Typography variant="caption" color="text.secondary">
              Expected Profit: <strong style={{ color: theme.palette.success.main }}>+{formatCurrency(viewTotals.expectedProfit, currency)}</strong>
            </Typography>
          )}
        </Box>
      </Box>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
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

      {/* CONFIRMATION DIALOG FOR SINGLE / MULTI DELETE */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            elevation: 4,
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {itemsToDelete.length > 1
            ? `Delete ${itemsToDelete.length} Transactions?`
            : 'Delete Transaction?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {itemsToDelete.length > 1
              ? `Are you sure you want to permanently delete these ${itemsToDelete.length} selected transactions? This will update running balances and cannot be undone.`
              : 'Are you sure you want to permanently delete this transaction? This will update running balances and cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete {itemsToDelete.length > 1 ? `(${itemsToDelete.length})` : ''}
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};
