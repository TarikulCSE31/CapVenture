import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Chip,
  Paper,
} from '@mui/material';
import {
  Close,
  ShoppingCart,
  ReceiptLong,
  PriceCheck,
  TrendingDown,
  PersonAdd,
} from '@mui/icons-material';
import {
  BusinessCustomer,
  BusinessTransaction,
  BusinessTransactionType,
  CurrencyConfig,
} from '../../types';

interface BusinessTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<BusinessTransaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
  customers: BusinessCustomer[];
  editingTransaction?: BusinessTransaction | null;
  currency: CurrencyConfig;
  onOpenCustomerModal?: () => void;
  initialType?: BusinessTransactionType;
  initialCustomerId?: string;
}

export const BusinessTransactionModal: React.FC<BusinessTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  editingTransaction,
  currency,
  onOpenCustomerModal,
  initialType = 'SALE',
  initialCustomerId,
}) => {
  const [type, setType] = useState<BusinessTransactionType>(initialType);
  const [customerId, setCustomerId] = useState<string>(initialCustomerId || '');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash' | 'Bank Transfer' | 'bKash/Nagad' | 'Check' | 'Other'
  >('Cash');
  const [description, setDescription] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setCustomerId(editingTransaction.customerId || '');
      setTotalAmount(editingTransaction.totalAmount.toString());
      setPaidAmount(editingTransaction.paidAmount.toString());
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDescription(editingTransaction.description || '');
      setReference(editingTransaction.reference || '');
    } else {
      setType(initialType);
      setCustomerId(initialCustomerId || '');
      setTotalAmount('');
      setPaidAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setDescription('');
      setReference('');
    }
  }, [editingTransaction, initialType, initialCustomerId, isOpen]);

  const handleTypeChange = (newType: BusinessTransactionType) => {
    if (!newType) return;
    setType(newType);
    if (newType === 'SALE') {
      if (totalAmount) setPaidAmount(totalAmount);
    } else if (newType === 'PAYMENT_RECEIVED') {
      if (paidAmount) setTotalAmount(paidAmount);
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    if (type === 'SALE') {
      setPaidAmount(val);
    }
  };

  const numTotal = parseFloat(totalAmount) || 0;
  const numPaid = type === 'SALE' ? numTotal : parseFloat(paidAmount) || 0;
  const calculatedDue = Math.max(0, numTotal - numPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== 'EXPENSE' && !customerId && customers.length > 0) {
      alert('Please select a customer.');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === customerId);

    let finalTotal = numTotal;
    let finalPaid = numPaid;
    let finalDue = 0;

    if (type === 'SALE') {
      finalPaid = finalTotal;
      finalDue = 0;
    } else if (type === 'CREDIT_SALE') {
      finalDue = calculatedDue;
    } else if (type === 'PAYMENT_RECEIVED') {
      finalTotal = finalPaid;
      finalDue = 0;
    } else if (type === 'EXPENSE') {
      finalPaid = finalTotal;
      finalDue = 0;
    }

    if (finalTotal <= 0 && finalPaid <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onSave(
      {
        userId: '',
        customerId: type !== 'EXPENSE' ? customerId : undefined,
        customerName:
          type !== 'EXPENSE' ? selectedCustomer?.name || 'Walk-in Customer' : undefined,
        date,
        type,
        totalAmount: finalTotal,
        paidAmount: finalPaid,
        dueAmount: finalDue,
        paymentMethod,
        description: description.trim(),
        reference: reference.trim(),
      },
      editingTransaction?.id
    );

    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
            borderRadius: { xs: 2.5, sm: 3 },
            backgroundImage: 'none',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            m: 0,
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            {editingTransaction ? 'Edit Transaction' : 'Record Business Transaction'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
              TRANSACTION TYPE
            </Typography>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(_, val) => val && handleTypeChange(val)}
              fullWidth
              size="small"
              sx={{
                display: { xs: 'grid', sm: 'flex' },
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'none' },
                '& .MuiToggleButton-root': {
                  py: 1.2,
                  px: { xs: 0.8, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  display: 'flex',
                  gap: 0.7,
                },
              }}
            >
              <ToggleButton value="SALE" color="success">
                <ShoppingCart fontSize="small" />
                Cash Sale
              </ToggleButton>
              <ToggleButton value="CREDIT_SALE" color="warning">
                <ReceiptLong fontSize="small" />
                Credit / Due Sale
              </ToggleButton>
              <ToggleButton value="PAYMENT_RECEIVED" color="info">
                <PriceCheck fontSize="small" />
                Collect Due
              </ToggleButton>
              <ToggleButton value="EXPENSE" color="error">
                <TrendingDown fontSize="small" />
                Expense
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            {/* Customer Selector (for Sales and Payments) */}
            {type !== 'EXPENSE' && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    select
                    label="Customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    fullWidth
                    required={customers.length > 0}
                    helperText={
                      customers.length === 0
                        ? 'No customers yet. Click + Add to register one.'
                        : 'Select the customer for this transaction'
                    }
                  >
                    {customers.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  {onOpenCustomerModal && (
                    <Button
                      variant="outlined"
                      onClick={onOpenCustomerModal}
                      sx={{ minWidth: '42px', px: 1.5, height: '54px', mb: '20px' }}
                      title="Add New Customer"
                    >
                      <PersonAdd />
                    </Button>
                  )}
                </Box>
              </Grid>
            )}

            {/* Total Bill / Sale Amount */}
            {type !== 'PAYMENT_RECEIVED' && (
              <Grid size={{ xs: 12, sm: type === 'CREDIT_SALE' ? 6 : 12 }}>
                <TextField
                  label={type === 'EXPENSE' ? 'Expense Amount' : 'Total Bill / Sale Amount'}
                  type="number"
                  value={totalAmount}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">{currency.symbol}</InputAdornment>
                      ),
                    },
                    htmlInput: { min: '0', step: 'any' },
                  }}
                />
              </Grid>
            )}

            {/* Paid / Collected Amount */}
            {(type === 'CREDIT_SALE' || type === 'PAYMENT_RECEIVED') && (
              <Grid size={{ xs: 12, sm: type === 'CREDIT_SALE' ? 6 : 12 }}>
                <TextField
                  label={type === 'PAYMENT_RECEIVED' ? 'Collected Amount' : 'Paid Amount (Now)'}
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">{currency.symbol}</InputAdornment>
                      ),
                    },
                    htmlInput: { min: '0', step: 'any' },
                  }}
                  helperText={
                    type === 'CREDIT_SALE' ? 'Amount paid upfront (0 if full credit)' : ''
                  }
                />
              </Grid>
            )}

            {/* Credit Sale Due Summary Box */}
            {type === 'CREDIT_SALE' && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.8,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(234, 179, 8, 0.08)' : '#fefce8',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(234, 179, 8, 0.3)' : '#fde047',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Customer Due Balance Created:
                  </Typography>
                  <Chip
                    label={`${currency.symbol}${calculatedDue.toLocaleString()}`}
                    color={calculatedDue > 0 ? 'warning' : 'success'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Paper>
              </Grid>
            )}

            {/* Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Grid>

            {/* Payment Method */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                fullWidth
                required
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="bKash/Nagad">bKash / Nagad</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            {/* Invoice / Reference */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Invoice / Memo / Ref #"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                fullWidth
                placeholder="e.g. INV-1049"
              />
            </Grid>

            {/* Description / Item Details */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Description / Items"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                placeholder="e.g. Rice 50kg, Mustard Oil 5L"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 1.5, sm: 2.5 }, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 1 }, '& > button': { width: { xs: '100%', sm: 'auto' } } }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editingTransaction ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
