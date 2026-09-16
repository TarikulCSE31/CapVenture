import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close,
  PersonAdd,
  Edit,
  DeleteOutlined,
  Phone,
  Mail,
  Business,
} from '@mui/icons-material';
import { Partner } from '../types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onSavePartner: (partner: Omit<Partner, 'id' | 'createdAt'>, existingId?: string) => void;
  onDeletePartner: (id: string) => void;
}

const AVATAR_COLORS = [
  '#1976d2', // blue
  '#2e7d32', // green
  '#ed6c02', // amber
  '#9c27b0', // purple
  '#0288d1', // cyan
  '#d32f2f', // red
  '#00796b', // teal
];

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  partners,
  onSavePartner,
  onDeletePartner,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const handleStartEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setName(partner.name);
    setPhone(partner.phone || '');
    setEmail(partner.email || '');
    setNotes(partner.notes || '');
    setAvatarColor(partner.avatarColor || AVATAR_COLORS[0]);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSavePartner(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        avatarColor,
      },
      editingId || undefined
    );
    handleResetForm();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <Business fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Business Partners
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage borrowers and partner contacts
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Add / Edit Form */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {editingId ? 'Edit Partner' : 'Add New Partner'}
                </Typography>
                {editingId && (
                  <Button size="small" onClick={handleResetForm} color="inherit">
                    Cancel
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Partner / Business Name *"
                  required
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe (Tech Logistics)"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Phone / WhatsApp"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@business.com"
                  />
                </Box>

                <TextField
                  label="Agreement Notes / Terms"
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 15% monthly net return"
                />

                {/* Color Avatar Picker */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Color Tag:
                  </Typography>
                  {AVATAR_COLORS.map((c) => (
                    <Box
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: c,
                        cursor: 'pointer',
                        transform: avatarColor === c ? 'scale(1.2)' : 'scale(1)',
                        border: avatarColor === c ? '2px solid white' : 'none',
                        boxShadow: avatarColor === c ? '0 0 0 1px rgba(0,0,0,0.3)' : 'none',
                        transition: 'transform 0.15s',
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAdd />}
                  >
                    {editingId ? 'Update Partner' : 'Save Partner'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Existing Partners List */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Existing Partners ({partners.length})
            </Typography>
            <List disablePadding>
              {partners.map((p, idx) => (
                <React.Fragment key={p.id}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleStartEdit(p)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        {partners.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"?`)) onDeletePartner(p.id);
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: p.avatarColor || 'primary.main', fontWeight: 700, fontSize: '0.9rem' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {p.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.3 }}>
                          {p.phone && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone style={{ fontSize: 12 }} /> {p.phone}
                            </Typography>
                          )}
                          {p.email && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Mail style={{ fontSize: 12 }} /> {p.email}
                            </Typography>
                          )}
                          {p.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {p.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
