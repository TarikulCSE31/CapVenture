import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  Close,
  GroupOutlined,
  PersonAdd,
  ContentCopy,
  Check,
  DeleteOutlined,
  BusinessOutlined,
  EmailOutlined,
  Edit,
  Refresh,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { AuthUser, CompanyInvitation, CompanyProfile, CompanyRole, UserRole } from '../types';
import { getShareableInviteLink } from '../utils/company';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  company: CompanyProfile | null;
  onUpdateCompany: (updated: CompanyProfile) => void;
  onSendInvite: (
    email: string,
    targetRole: UserRole,
    companyRole: CompanyRole
  ) => Promise<{ success: boolean; invite?: CompanyInvitation; error?: string }>;
  onRevokeInvite: (inviteId: string) => void;
  onConfirmMember?: (inviteId: string) => Promise<void> | void;
  onRefreshSync?: () => Promise<void> | void;
  invitations: CompanyInvitation[];
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  company,
  onUpdateCompany,
  onSendInvite,
  onRevokeInvite,
  onConfirmMember,
  onRefreshSync,
  invitations,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole>('INVESTOR');
  const [companyRole, setCompanyRole] = useState<CompanyRole>('MEMBER');
  const [isSending, setIsSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [lastCreatedInvite, setLastCreatedInvite] = useState<CompanyInvitation | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Edit Company Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [companyName, setCompanyName] = useState(company?.name || '');

  const handleSaveCompanyName = () => {
    if (!company || !companyName.trim()) return;
    const updated: CompanyProfile = {
      ...company,
      name: companyName.trim(),
    };
    onUpdateCompany(updated);
    setIsEditingName(false);
  };

  const handleSendInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address to invite.');
      return;
    }

    setIsSending(true);
    const res = await onSendInvite(inviteEmail.trim(), targetRole, companyRole);
    setIsSending(false);

    if (res.success && res.invite) {
      setLastCreatedInvite(res.invite);
      setInviteEmail('');
    } else {
      setInviteError(res.error || 'Failed to create invitation.');
    }
  };

  const handleCopyLink = (token: string) => {
    const link = getShareableInviteLink(token);
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => {
      setCopiedToken(null);
    }, 2500);
  };

  const handleRefreshClick = async () => {
    if (!onRefreshSync) return;
    setIsRefreshing(true);
    try {
      await onRefreshSync();
    } finally {
      setIsRefreshing(false);
    }
  };

  const companyInvitations = invitations.filter(
    (inv) =>
      inv.companyId === company?.id &&
      inv.status === 'PENDING' &&
      !company?.members.some(
        (m) => m.email.trim().toLowerCase() === inv.invitedEmail.trim().toLowerCase()
      )
  );
  const isOwnerOrAdmin = currentUser && company && (
    company.ownerId === currentUser.id ||
    company.members.some((m) => (m.userId === currentUser.id || m.email === currentUser.email) && ['OWNER', 'ADMIN'].includes(m.companyRole))
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' },
            maxHeight: { xs: 'calc(100% - 24px)', sm: '88vh' },
            borderRadius: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <GroupOutlined fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
              Team & Organization
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Invite colleagues and collaborate with shared data access
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {onRefreshSync && (
            <Tooltip title="Sync / Refresh Team">
              <span>
                <IconButton onClick={handleRefreshClick} size="small" disabled={isRefreshing}>
                  <Refresh
                    fontSize="small"
                    sx={{
                      animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          overflowY: 'auto',
        }}
      >
        {/* Company Identity Header */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                Company / Organization Profile
              </Typography>
              {isEditingName ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    fullWidth
                    autoFocus
                  />
                  <Button variant="contained" size="small" onClick={handleSaveCompanyName}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => setIsEditingName(false)}>
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <BusinessOutlined fontSize="small" color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {company?.name || 'My Organization'}
                  </Typography>
                  {isOwnerOrAdmin && (
                    <IconButton size="small" onClick={() => { setCompanyName(company?.name || ''); setIsEditingName(true); }}>
                      <Edit fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${company?.members.length || 1} Member${(company?.members.length || 1) === 1 ? '' : 's'}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 24, fontWeight: 600, fontSize: '0.75rem' }}
              />
              {companyInvitations.length > 0 && (
                <Chip
                  label={`${companyInvitations.length} Pending`}
                  size="small"
                  color="warning"
                  sx={{ height: 24, fontWeight: 600, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Invite Member Section (Available to Owner & Admin) */}
        {isOwnerOrAdmin && (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <PersonAdd fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Invite Colleague via Email
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              When your colleague registers with this email address, they will automatically be joined to this organization and granted access to all shared records.
            </Typography>

            <form onSubmit={handleSendInviteSubmit}>
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Portal</InputLabel>
                    <Select
                      value={targetRole}
                      label="Portal"
                      onChange={(e) => setTargetRole(e.target.value as UserRole)}
                    >
                      <MenuItem value="INVESTOR">Investor</MenuItem>
                      <MenuItem value="BUSINESS_OPERATOR">Business</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Permission</InputLabel>
                    <Select
                      value={companyRole}
                      label="Permission"
                      onChange={(e) => setCompanyRole(e.target.value as CompanyRole)}
                    >
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="MEMBER">Member</MenuItem>
                      <MenuItem value="VIEWER">Viewer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSending}
                    startIcon={<EmailOutlined />}
                    sx={{ fontWeight: 600, textTransform: 'none' }}
                  >
                    {isSending ? 'Generating Invite...' : 'Send Invitation & Generate Link'}
                  </Button>
                </Grid>
              </Grid>
            </form>

            {inviteError && (
              <Alert severity="error" sx={{ mt: 1.5, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
                {inviteError}
              </Alert>
            )}

            {lastCreatedInvite && (
              <Alert
                severity="success"
                icon={<Check fontSize="inherit" />}
                sx={{ mt: 2, '& .MuiAlert-message': { width: '100%' } }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Invitation created for {lastCreatedInvite.invitedEmail}!
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                  Share this 1-click registration link directly with your team member:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '80%',
                    }}
                  >
                    {getShareableInviteLink(lastCreatedInvite.token)}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copiedToken === lastCreatedInvite.token ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    onClick={() => handleCopyLink(lastCreatedInvite.token)}
                    sx={{ minWidth: 80, fontSize: '0.75rem' }}
                  >
                    {copiedToken === lastCreatedInvite.token ? 'Copied' : 'Copy'}
                  </Button>
                </Box>
              </Alert>
            )}
          </Paper>
        )}

        {/* Active Members List */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Active Organization Members ({company?.members.length || 1})
            </Typography>
          </Box>
          <List disablePadding>
            {(company?.members || []).map((member, idx) => {
              const isCurrentUser = currentUser && (currentUser.id === member.userId || currentUser.email === member.email);
              const isOwner = member.companyRole === 'OWNER';
              return (
                <React.Fragment key={member.userId || member.email}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          label={member.companyRole}
                          size="small"
                          color={isOwner ? 'primary' : 'default'}
                          variant={isOwner ? 'filled' : 'outlined'}
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                        {isCurrentUser && (
                          <Chip label="You" size="small" color="secondary" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
                        )}
                      </Box>
                    }
                    sx={{ py: 1.2, px: 2 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: '0.85rem', bgcolor: isOwner ? 'primary.main' : 'grey.600' }}>
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {member.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>

        {/* Pending Invitations List */}
        {companyInvitations.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Pending Email Invitations ({companyInvitations.length})
              </Typography>
            </Box>
            <List disablePadding>
              {companyInvitations.map((inv, idx) => (
                <React.Fragment key={inv.id}>
                  {idx > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {isOwnerOrAdmin && onConfirmMember && (
                          <Tooltip title="Confirm user has joined - Add to Active Organization Members">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleOutlined sx={{ fontSize: '0.95rem !important' }} />}
                              onClick={() => onConfirmMember(inv.id)}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                py: 0.3,
                                px: 1.2,
                                minWidth: 0,
                                borderRadius: 1.5,
                                boxShadow: 'none',
                              }}
                            >
                              Approve
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Copy Invite Link">
                          <IconButton size="small" onClick={() => handleCopyLink(inv.token)}>
                            {copiedToken === inv.token ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        {isOwnerOrAdmin && (
                          <Tooltip title="Revoke Invitation">
                            <IconButton size="small" color="error" onClick={() => onRevokeInvite(inv.id)}>
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      pr: { xs: 20, sm: 22 },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: '0.85rem', bgcolor: 'warning.main' }}>
                        <EmailOutlined fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {inv.invitedEmail}
                          </Typography>
                          <Chip label={inv.targetRole === 'INVESTOR' ? 'Investor' : 'Business'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ fontSize: '0.725rem', color: 'text.secondary' }}>
                          Role: {inv.companyRole} • Sent: {new Date(inv.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
