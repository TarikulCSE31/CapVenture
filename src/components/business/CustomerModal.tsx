import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import { Close, Person, Phone, Mail, Home, Notes } from '@mui/icons-material';
import { BusinessCustomer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BusinessCustomer, 'id' | 'createdAt'>, existingId?: string) => void;
  editingCustomer: BusinessCustomer | null;
}

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#dc2626', // red
  '#0891b2', // cyan
  '#db2777', // pink
];

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCustomer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setPhone(editingCustomer.phone);
      setEmail(editingCustomer.email || '');
      setAddress(editingCustomer.address || '');
      setNotes(editingCustomer.notes || '');
      setAvatarColor(editingCustomer.avatarColor || AVATAR_COLORS[0]);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  }, [editingCustomer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide customer name and phone number.');
      return;
    }

    onSave(
      {
        userId: editingCustomer?.userId || '',
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        avatarColor,
      },
      editingCustomer?.id
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
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            
            {/* Customer Name */}
            <TextField
              label="Customer / Client Name *"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Al-Amin Traders or Tanvir Ahmed"
              autoFocus
            />

            {/* Phone & Email */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone Number *"
                  required
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01712-345678"
                  slotProps={{
                    input: {
                      startAdornment: <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@domain.com"
                  slotProps={{
                    input: {
                      startAdornment: <Mail fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Address */}
            <TextField
              label="Shop / Office / Delivery Address"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop #14, Ground Floor, New Market, Dhaka"
              slotProps={{
                input: {
                  startAdornment: <Home fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                },
              }}
            />

            {/* Notes */}
            <TextField
              label="Notes / Terms / Credit Limit"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wholesale buyer, 15 days credit terms allowed"
              slotProps={{
                input: {
                  startAdornment: <Notes fontSize="small" sx={{ mr: 1, mt: 1, color: 'text.secondary', alignSelf: 'flex-start' }} />,
                },
              }}
            />

            {/* Color Avatar Selection */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Badge Color:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {AVATAR_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: avatarColor === c ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: avatarColor === c ? '0 0 0 2px #2563eb' : 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  />
                ))}
              </Box>
            </Box>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 }, '& > button': { width: { xs: '100%', sm: 'auto' } } }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editingCustomer ? 'Update Customer' : 'Save Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
