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
  Alert,
  InputAdornment,
  Chip,
  Paper,
} from '@mui/material';
import {
  Close,
  CallMade,
  CallReceived,
  TrendingUp,
  Loop,
} from '@mui/icons-material';
import { CurrencyConfig, Partner, Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  partners: Partner[];
  editingTransaction?: Transaction | null;
  currency: CurrencyConfig;
  onOpenPartnerModal: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partners,
  editingTransaction,
  currency,
  onOpenPartnerModal,
}) => {
  const [type, setType] = useState<TransactionType>('INVESTMENT_OUT');
  const [partnerId, setPartnerId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [reference, setReference] = useState<string>('');
  const [expectedProfit, setExpectedProfit] = useState<string>('');
  const [expectedProfitRate, setExpectedProfitRate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setPartnerId(editingTransaction.partnerId);
      setAmount(editingTransaction.amount ? editingTransaction.amount.toString() : '');
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'Bank Transfer');
      setReference(editingTransaction.reference || '');
      setExpectedProfit(editingTransaction.expectedProfit ? editingTransaction.expectedProfit.toString() : '');
      setExpectedProfitRate(editingTransaction.expectedProfitRate ? editingTransaction.expectedProfitRate.toString() : '');
      setTargetDate(editingTransaction.targetDate || '');
    } else {
      setType('INVESTMENT_OUT');
      setPartnerId(partners[0]?.id || '');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('Bank Transfer');
      setReference('');
      setExpectedProfit('');
      setExpectedProfitRate('');
      setTargetDate('');
    }
  }, [editingTransaction, isOpen, partners]);

  const handleExpectedProfitChange = (val: string) => {
    setExpectedProfit(val);
    const profitNum = parseFloat(val);
    const principalNum = parseFloat(amount);
    if (!isNaN(profitNum) && !isNaN(principalNum) && principalNum > 0) {
      setExpectedProfitRate(((profitNum / principalNum) * 100).toFixed(1));
    }
  };

  const handleExpectedProfitRateChange = (val: string) => {
    setExpectedProfitRate(val);
    const rateNum = parseFloat(val);
    const principalNum = parseFloat(amount);
    if (!isNaN(rateNum) && !isNaN(principalNum) && principalNum > 0) {
      setExpectedProfit(((principalNum * rateNum) / 100).toFixed(2));
    }
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    const principalNum = parseFloat(newAmount);
    const rateNum = parseFloat(expectedProfitRate);
    if (!isNaN(principalNum) && !isNaN(rateNum) && principalNum > 0) {
      setExpectedProfit(((principalNum * rateNum) / 100).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!partnerId) {
      alert('Please select or create a partner/borrower.');
      return;
    }

    onSave(
      {
        partnerId,
        date,
        amount: num,
        type,
        description: description.trim() || getDefaultDescription(type),
        paymentMethod,
        reference: reference.trim(),
        expectedProfit: type === 'INVESTMENT_OUT' && expectedProfit ? parseFloat(expectedProfit) : undefined,
        expectedProfitRate: type === 'INVESTMENT_OUT' && expectedProfitRate ? parseFloat(expectedProfitRate) : undefined,
        targetDate: type === 'INVESTMENT_OUT' && targetDate ? targetDate : undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  const getDefaultDescription = (t: TransactionType) => {
    switch (t) {
      case 'INVESTMENT_OUT': return 'Capital investment disbursed';
      case 'PRINCIPAL_RETURN': return 'Principal capital returned';
      case 'PROFIT_PAYOUT': return 'Profit distribution payout received';
      case 'REINVEST': return 'Profit reinvested into principal';
    }
  };

  const addPresetAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    handleAmountChange((current + add).toString());
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Update capital investment, returns, or profit payouts
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Type Selector */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                Transaction Category
              </Typography>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, val) => val && setType(val)}
                fullWidth
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  },
                }}
              >
                <ToggleButton value="INVESTMENT_OUT" color="primary">
                  <CallMade sx={{ mr: 0.5, fontSize: 16 }} /> Invest Out
                </ToggleButton>
                <ToggleButton value="PRINCIPAL_RETURN" color="warning">
                  <CallReceived sx={{ mr: 0.5, fontSize: 16 }} /> Principal Back
                </ToggleButton>
                <ToggleButton value="PROFIT_PAYOUT" color="success">
                  <TrendingUp sx={{ mr: 0.5, fontSize: 16 }} /> Profit Share
                </ToggleButton>
                <ToggleButton value="REINVEST" color="secondary">
                  <Loop sx={{ mr: 0.5, fontSize: 16 }} /> Reinvest
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Context Alert */}
              <Alert 
                severity={
                  type === 'PROFIT_PAYOUT' ? 'success' : 
                  type === 'PRINCIPAL_RETURN' ? 'warning' : 
                  type === 'REINVEST' ? 'secondary' as any : 'info'
                }
                sx={{ mt: 1.5, py: 0.2, '& .MuiAlert-message': { fontSize: '0.78rem' } }}
              >
                {type === 'INVESTMENT_OUT' && 'Increases active capital lent to the partner.'}
                {type === 'PRINCIPAL_RETURN' && 'Reduces outstanding debt/capital. Does not inflate profit metrics.'}
                {type === 'PROFIT_PAYOUT' && 'Your profit earnings! Does not change principal owed.'}
                {type === 'REINVEST' && 'Records profit earned and rolls it directly into active principal.'}
              </Alert>
            </Box>

            {/* Amount & Quick Add */}
            <Box>
              <TextField
                label="Amount"
                type="number"
                required
                fullWidth
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                  },
                  htmlInput: { min: '0', step: 'any' },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Quick add:</Typography>
                {[500, 1000, 2500, 5000].map((val) => (
                  <Chip
                    key={val}
                    label={`+${val}`}
                    size="small"
                    onClick={() => addPresetAmount(val)}
                    clickable
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Expected Profit Option (When Disbursing Capital) */}
            {type === 'INVESTMENT_OUT' && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(46, 125, 50, 0.04)',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.3)' : 'rgba(46, 125, 50, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp fontSize="small" color="success" /> Expected Profit Target
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Forecast & ROI Tracking (Optional)
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Expected Profit Amount"
                      type="number"
                      fullWidth
                      size="small"
                      placeholder="e.g. 1500"
                      value={expectedProfit}
                      onChange={(e) => handleExpectedProfitChange(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                        },
                        htmlInput: { min: '0', step: 'any' },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Expected Return Rate"
                      type="number"
                      fullWidth
                      size="small"
                      placeholder="e.g. 15"
                      value={expectedProfitRate}
                      onChange={(e) => handleExpectedProfitRateChange(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        },
                        htmlInput: { min: '0', step: 'any' },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Target Payout / Maturity Date"
                      type="date"
                      fullWidth
                      size="small"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Partner & Date Grid */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Partner / Borrower</Typography>
                  <Button size="small" onClick={onOpenPartnerModal} sx={{ p: 0, minWidth: 0, fontSize: '0.75rem' }}>
                    + New
                  </Button>
                </Box>
                <TextField
                  select
                  required
                  fullWidth
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                >
                  {partners.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Date
                </Typography>
                <TextField
                  type="date"
                  required
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Description */}
            <TextField
              label="Description / Memo"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getDefaultDescription(type)}
            />

            {/* Payment Method & Reference */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Payment Channel"
                  fullWidth
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="Bank Transfer">Bank Transfer / Wire</MenuItem>
                  <MenuItem value="Cash">Cash in hand</MenuItem>
                  <MenuItem value="Check">Check / Pay order</MenuItem>
                  <MenuItem value="Online / Mobile">Online / Mobile Wallet</MenuItem>
                  <MenuItem value="Crypto">Crypto</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Reference / Receipt #"
                  fullWidth
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-1029"
                />
              </Grid>
            </Grid>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editingTransaction ? 'Update Entry' : 'Save Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
