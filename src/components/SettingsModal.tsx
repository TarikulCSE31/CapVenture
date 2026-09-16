import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  Close,
  CloudDone,
  Download,
  Upload,
  FileDownload,
  RotateLeft,
  DeleteOutlined,
  Storage,
  Language,
} from '@mui/icons-material';
import { AppSettings, AppwriteConfig } from '../types';
import {
  exportBackupJson,
  importBackupJson,
  triggerDownload,
  INITIAL_DEMO_PARTNERS,
  INITIAL_DEMO_TRANSACTIONS,
  saveStoredPartners,
  saveStoredTransactions,
  saveStoredSettings,
  getStoredPartners,
  getStoredTransactions,
} from '../utils/storage';
import {
  testAppwriteConnection,
  syncLocalToAppwrite,
  fetchPartnersFromAppwrite,
  fetchTransactionsFromAppwrite,
} from '../utils/appwrite';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDataReloaded: () => void;
  onExportCsv: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataReloaded,
  onExportCsv,
}) => {
  const [appwriteConfig, setAppwriteConfig] = useState<AppwriteConfig>(settings.appwrite);
  const [isTestingAppwrite, setIsTestingAppwrite] = useState(false);
  const [appwriteTestResult, setAppwriteTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isSyncingAppwrite, setIsSyncingAppwrite] = useState(false);

  // Tab State: 0 = Appwrite, 1 = Backup, 2 = Hosting
  const [tabIndex, setTabIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveAppwrite = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      appwrite: {
        ...appwriteConfig,
        endpoint: appwriteConfig.endpoint.trim(),
        projectId: appwriteConfig.projectId.trim(),
        databaseId: appwriteConfig.databaseId.trim(),
        partnersCollectionId: appwriteConfig.partnersCollectionId.trim(),
        transactionsCollectionId: appwriteConfig.transactionsCollectionId.trim(),
      },
    };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
    alert('Appwrite settings saved!');
  };

  const handleTestAppwrite = async () => {
    setIsTestingAppwrite(true);
    setAppwriteTestResult(null);
    const res = await testAppwriteConnection(appwriteConfig);
    setIsTestingAppwrite(false);
    setAppwriteTestResult(res);
  };

  const handlePushToAppwrite = async () => {
    setIsSyncingAppwrite(true);
    const partners = getStoredPartners();
    const transactions = getStoredTransactions();
    const res = await syncLocalToAppwrite(appwriteConfig, partners, transactions);
    setIsSyncingAppwrite(false);
    if (res.success) {
      alert(`Uploaded ${partners.length} partners and ${transactions.length} transactions to Appwrite!`);
    } else {
      alert(`Sync failed: ${res.error}`);
    }
  };

  const handlePullFromAppwrite = async () => {
    if (!confirm('Merge remote Appwrite records into your local database?')) return;
    setIsSyncingAppwrite(true);
    try {
      const [remotePartners, remoteTransactions] = await Promise.all([
        fetchPartnersFromAppwrite(appwriteConfig),
        fetchTransactionsFromAppwrite(appwriteConfig),
      ]);
      if (remotePartners.length > 0) saveStoredPartners(remotePartners);
      if (remoteTransactions.length > 0) saveStoredTransactions(remoteTransactions);
      onDataReloaded();
      alert(`Imported ${remotePartners.length} partners and ${remoteTransactions.length} transactions from Appwrite!`);
    } catch (err: any) {
      alert(`Failed to pull from Appwrite: ${err.message}`);
    } finally {
      setIsSyncingAppwrite(false);
    }
  };

  const handleExportJson = () => {
    const json = exportBackupJson();
    const filename = `capventure-backup-${new Date().toISOString().split('T')[0]}.json`;
    triggerDownload(json, filename, 'application/json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBackupJson(content);
        if (res.success) {
          alert('Backup restored successfully!');
          onDataReloaded();
          onClose();
        } else {
          alert(`Failed to restore: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Reset database back to the sample demo data? Custom entries will be overwritten.')) {
      saveStoredPartners(INITIAL_DEMO_PARTNERS);
      saveStoredTransactions(INITIAL_DEMO_TRANSACTIONS);
      onDataReloaded();
      alert('Demo data restored!');
      onClose();
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Are you sure you want to delete ALL transactions and partners?')) {
      saveStoredPartners([]);
      saveStoredTransactions([]);
      onDataReloaded();
      alert('All records cleared.');
      onClose();
    }
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
      <DialogTitle sx={{ m: 0, p: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Settings & Cloud Sync
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Manage Appwrite sync, data backups, and free hosting
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1.5, sm: 2.5 } }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.78rem', sm: '0.85rem' },
              minHeight: 44,
              px: { xs: 1.5, sm: 2 },
            },
          }}
        >
          <Tab icon={<CloudDone fontSize="small" />} iconPosition="start" label="Appwrite Cloud" />
          <Tab icon={<Storage fontSize="small" />} iconPosition="start" label="Backup & Data" />
          <Tab icon={<Language fontSize="small" />} iconPosition="start" label="Free Hosting" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* TAB 0: Appwrite Cloud */}
        {tabIndex === 0 && (
          <form onSubmit={handleSaveAppwrite}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Appwrite Cloud Database Sync
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Singapore Region • TablesDB active
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appwriteConfig.enabled}
                        onChange={(e) => setAppwriteConfig({ ...appwriteConfig, enabled: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Enabled</Typography>}
                  />
                </Box>
              </Paper>

              <TextField
                label="API Endpoint"
                fullWidth
                value={appwriteConfig.endpoint}
                onChange={(e) => setAppwriteConfig({ ...appwriteConfig, endpoint: e.target.value })}
                placeholder="https://sgp.cloud.appwrite.io/v1"
                helperText="Your project's regional endpoint"
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Project ID"
                    required
                    fullWidth
                    value={appwriteConfig.projectId}
                    onChange={(e) => setAppwriteConfig({ ...appwriteConfig, projectId: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Database ID"
                    required
                    fullWidth
                    value={appwriteConfig.databaseId}
                    onChange={(e) => setAppwriteConfig({ ...appwriteConfig, databaseId: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Partners Table ID"
                    required
                    fullWidth
                    value={appwriteConfig.partnersCollectionId}
                    onChange={(e) => setAppwriteConfig({ ...appwriteConfig, partnersCollectionId: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Transactions Table ID"
                    required
                    fullWidth
                    value={appwriteConfig.transactionsCollectionId}
                    onChange={(e) => setAppwriteConfig({ ...appwriteConfig, transactionsCollectionId: e.target.value })}
                  />
                </Grid>
              </Grid>

              {appwriteTestResult && (
                <Alert severity={appwriteTestResult.success ? 'success' : 'error'}>
                  {appwriteTestResult.success ? 'Connected successfully to Appwrite TablesDB!' : appwriteTestResult.error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleTestAppwrite}
                  disabled={isTestingAppwrite}
                >
                  {isTestingAppwrite ? 'Testing...' : 'Test Connection'}
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handlePushToAppwrite}
                    disabled={isSyncingAppwrite}
                  >
                    Push to Cloud
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handlePullFromAppwrite}
                    disabled={isSyncingAppwrite}
                  >
                    Pull from Cloud
                  </Button>
                  <Button type="submit" variant="contained" size="small">
                    Save
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        )}

        {/* TAB 1: Backup & Data */}
        {tabIndex === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Full JSON Backup & Restore
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Export a snapshot of all records or restore from a JSON file.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleExportJson}
                >
                  Download JSON
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Restore JSON
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownload />}
                  onClick={onExportCsv}
                >
                  Export CSV
                </Button>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Reset Actions
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Reload sample data for testing or clear all entries.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<RotateLeft />}
                  onClick={handleResetDemo}
                >
                  Reset Demo Data
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlined />}
                  onClick={handleClearAll}
                >
                  Clear All Data
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* TAB 2: Free Hosting */}
        {tabIndex === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
              Because CapVenture is a modern Single Page App, you can host it 100% free on Vercel or Cloudflare Pages.
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Deploy to Vercel in 1 Minute:
              </Typography>
              <Box component="ol" sx={{ pl: 2.5, mt: 1, mb: 0, fontSize: '0.8125rem', color: 'text.secondary' }}>
                <li>Your project is pushed to: <strong>github.com/TarikulCSE31/CapVenture</strong></li>
                <li>Go to <strong>vercel.com</strong> $\rightarrow$ click <strong>Add New Project</strong>.</li>
                <li>Select <code>CapVenture</code> and click <strong>Deploy</strong>.</li>
                <li>You get a free live URL (e.g. <code>capventure.vercel.app</code>) with automated HTTPS.</li>
              </Box>
            </Paper>
          </Box>
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
