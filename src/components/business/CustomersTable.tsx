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
  Tooltip,
  Avatar,
  Card,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Edit,
  DeleteOutlined,
  PriceCheck,
  AddShoppingCart,
  Phone,
  Email,
  CheckCircle,
  WarningAmber,
  People,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { CustomerWithBalance, CurrencyConfig } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface CustomersTableProps {
  customers: CustomerWithBalance[];
  currency: CurrencyConfig;
  onAddCustomer: () => void;
  onEditCustomer: (customer: CustomerWithBalance) => void;
  onDeleteCustomer: (id: string) => void;
  onCollectDue: (customer: CustomerWithBalance) => void;
  onNewSale: (customer: CustomerWithBalance) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  currency,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onCollectDue,
  onNewSale,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDue, setFilterDue] = useState<'ALL' | 'WITH_DUE' | 'CLEARED'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Summary counts
  const totalDueAmount = useMemo(
    () => customers.reduce((sum, c) => sum + c.totalDue, 0),
    [customers]
  );
  const customersWithDueCount = useMemo(
    () => customers.filter((c) => c.totalDue > 0).length,
    [customers]
  );

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Due filter
      if (filterDue === 'WITH_DUE' && c.totalDue <= 0) return false;
      if (filterDue === 'CLEARED' && c.totalDue > 0) return false;

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term))
      );
    });
  }, [customers, searchTerm, filterDue]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredCustomers, page, rowsPerPage]);

  const customerToDelete = customers.find((c) => c.id === deleteConfirmId);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Metric Mini Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.2, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
              }}
            >
              <People sx={{ fontSize: { xs: 20, sm: 26 } }} />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                CUSTOMERS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
                {customers.length}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.2, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.main,
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
              }}
            >
              <WarningAmber sx={{ fontSize: { xs: 20, sm: 26 } }} />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                WITH DUE
              </Typography>
              <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
                {customersWithDueCount}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.2, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
                width: { xs: 36, sm: 48 },
                height: { xs: 36, sm: 48 },
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: { xs: 20, sm: 26 } }} />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                TOTAL OUTSTANDING DUE
              </Typography>
              <Typography variant="h5" color="error.main" sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
                {formatCurrency(totalDueAmount, currency)}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Paper */}
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
              placeholder="Search by name, phone..."
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
              value={filterDue}
              exclusive
              onChange={(_, val) => val && setFilterDue(val)}
              size="small"
              sx={{
                overflowX: 'auto',
                maxWidth: '100%',
                py: 0.5,
                '& .MuiToggleButton-root': {
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <ToggleButton value="ALL">All ({customers.length})</ToggleButton>
              <ToggleButton value="WITH_DUE">
                Due ({customersWithDueCount})
              </ToggleButton>
              <ToggleButton value="CLEARED">
                Cleared ({customers.length - customersWithDueCount})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={onAddCustomer}
            sx={{ width: { xs: '100%', sm: 'auto' }, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Add Customer
          </Button>
        </Box>

        {/* Table Content */}
        <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact & Address</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total Purchases
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Total Paid
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Due Balance
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <People sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {customers.length === 0
                        ? 'No customers added yet. Click "Add Customer" to start tracking!'
                        : 'No customers match your search or filter.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const hasDue = customer.totalDue > 0;
                  return (
                    <TableRow
                      key={customer.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: hasDue ? alpha(theme.palette.error.main, 0.02) : 'transparent',
                      }}
                    >
                      {/* Customer Info */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: customer.avatarColor || '#2563eb',
                              color: '#ffffff',
                              fontWeight: 700,
                              width: 38,
                              height: 38,
                              fontSize: '0.95rem',
                            }}
                          >
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.transactionCount} transactions
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Contact & Address */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{customer.phone}</Typography>
                          </Box>
                          {customer.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                              <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {customer.email}
                              </Typography>
                            </Box>
                          )}
                          {customer.address && (
                            <Typography variant="caption" color="text.secondary">
                              {customer.address}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Total Purchases */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(customer.totalSales, currency)}
                        </Typography>
                      </TableCell>

                      {/* Total Paid */}
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          {formatCurrency(customer.totalPaid, currency)}
                        </Typography>
                      </TableCell>

                      {/* Outstanding Due */}
                      <TableCell align="right">
                        {hasDue ? (
                          <Chip
                            label={formatCurrency(customer.totalDue, currency)}
                            color="error"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              px: 0.5,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircle fontSize="small" />}
                            label="Cleared"
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          {hasDue && (
                            <Tooltip title="Collect Due Payment">
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<PriceCheck />}
                                onClick={() => onCollectDue(customer)}
                                sx={{
                                  fontSize: '0.75rem',
                                  py: 0.4,
                                  px: 1,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                }}
                              >
                                Collect
                              </Button>
                            </Tooltip>
                          )}

                          <Tooltip title="New Sale to Customer">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onNewSale(customer)}
                            >
                              <AddShoppingCart fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Details">
                            <IconButton
                              size="small"
                              color="default"
                              onClick={() => onEditCustomer(customer)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Customer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirmId(customer.id)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Customer?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete customer{' '}
            <strong>{customerToDelete?.name}</strong>? All associated sales records will remain
            in your business ledger.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirmId) {
                onDeleteCustomer(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
          >
            Delete Customer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
