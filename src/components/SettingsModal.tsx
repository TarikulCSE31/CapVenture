import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  Copy, 
  Globe, 
  Check, 
  AlertCircle, 
  Server 
} from 'lucide-react';
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
  getStoredTransactions
} from '../utils/storage';
import { 
  testAppwriteConnection, 
  syncLocalToAppwrite, 
  fetchPartnersFromAppwrite, 
  fetchTransactionsFromAppwrite 
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
  // Appwrite State
  const [appwriteConfig, setAppwriteConfig] = useState<AppwriteConfig>(
    settings.appwrite || {
      enabled: false,
      endpoint: 'https://cloud.appwrite.io/v1',
      projectId: '',
      databaseId: 'capventure_db',
      partnersCollectionId: 'partners',
      transactionsCollectionId: 'transactions',
    }
  );
  const [isTestingAppwrite, setIsTestingAppwrite] = useState(false);
  const [appwriteTestResult, setAppwriteTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [isSyncingAppwrite, setIsSyncingAppwrite] = useState(false);

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '');
  const [useSupabase, setUseSupabase] = useState(settings.useSupabase || false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'storage' | 'hosting' | 'appwrite' | 'cloud'>('appwrite');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Save Appwrite
  const handleSaveAppwriteSettings = (e: React.FormEvent) => {
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
    if (!appwriteConfig.projectId.trim()) {
      alert('Please enter your Appwrite Project ID first.');
      return;
    }
    setIsTestingAppwrite(true);
    setAppwriteTestResult(null);
    const res = await testAppwriteConnection(appwriteConfig);
    setIsTestingAppwrite(false);
    setAppwriteTestResult(res);
  };

  const handlePushToAppwrite = async () => {
    if (!appwriteConfig.projectId.trim()) {
      alert('Please enter your Appwrite credentials first.');
      return;
    }
    setIsSyncingAppwrite(true);
    const partners = getStoredPartners();
    const transactions = getStoredTransactions();
    const res = await syncLocalToAppwrite(appwriteConfig, partners, transactions);
    setIsSyncingAppwrite(false);
    if (res.success) {
      alert(`Successfully synced ${partners.length} partners and ${transactions.length} transactions to Appwrite!`);
    } else {
      alert(`Sync failed: ${res.error}`);
    }
  };

  const handlePullFromAppwrite = async () => {
    if (!appwriteConfig.projectId.trim()) {
      alert('Please enter your Appwrite credentials first.');
      return;
    }
    if (!confirm('Pulling from Appwrite will merge remote records into your local tracker. Proceed?')) {
      return;
    }
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

  // Save Supabase
  const handleSaveCloudSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      useSupabase: Boolean(supabaseUrl.trim() && supabaseKey.trim() && useSupabase),
    };
    onUpdateSettings(updated);
    saveStoredSettings(updated);
    alert('Supabase settings saved!');
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
    if (confirm('Reset your database back to the sample demo data? Any unsaved custom entries will be replaced.')) {
      saveStoredPartners(INITIAL_DEMO_PARTNERS);
      saveStoredTransactions(INITIAL_DEMO_TRANSACTIONS);
      onDataReloaded();
      alert('Demo data restored!');
      onClose();
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ Are you sure you want to delete ALL transactions and partners? This action cannot be undone.')) {
      saveStoredPartners([]);
      saveStoredTransactions([]);
      onDataReloaded();
      alert('All records cleared. You are ready for fresh data!');
      onClose();
    }
  };

  const sqlSchema = `-- Copy & Paste this into your free Supabase SQL Editor:
create table partners (
  id text primary key,
  name text not null,
  phone text,
  email text,
  notes text,
  avatar_color text,
  created_at timestamp with time zone default now()
);

create table transactions (
  id text primary key,
  partner_id text references partners(id) on delete cascade,
  date date not null,
  amount numeric not null,
  type text not null,
  description text,
  payment_method text,
  reference text,
  created_at timestamp with time zone default now()
);

alter table partners enable row level security;
alter table transactions enable row level security;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div>
            <h2 className="text-lg font-bold text-white">App Settings & Cloud Sync</h2>
            <p className="text-xs text-slate-400">Appwrite, Supabase, backup data, and free hosting guide</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('appwrite')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'appwrite'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            Appwrite Cloud Sync
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'storage'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💾 Backup & Data
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'hosting'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 Free Hosting Guide
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'cloud'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ☁️ Supabase Sync
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          
          {/* TAB: Appwrite Sync */}
          {activeTab === 'appwrite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-pink-400" />
                    <h3 className="text-sm font-bold text-white">Appwrite Cloud & Self-Hosted Sync</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
                    Free Tier (2GB / 75k MAU)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Connect your free <strong>Appwrite Cloud</strong> account (or your self-hosted instance) to automatically sync transactions and partners across all your devices in real-time.
                </p>
              </div>

              <form onSubmit={handleSaveAppwriteSettings} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="appwriteEnabled"
                      checked={appwriteConfig.enabled}
                      onChange={(e) => setAppwriteConfig({ ...appwriteConfig, enabled: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-pink-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="appwriteEnabled" className="text-xs font-bold text-white cursor-pointer">
                      Enable Appwrite Sync
                    </label>
                  </div>

                  {appwriteConfig.enabled && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    required
                    value={appwriteConfig.endpoint}
                    onChange={(e) => setAppwriteConfig({ ...appwriteConfig, endpoint: e.target.value })}
                    placeholder="https://cloud.appwrite.io/v1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Default is <code className="text-pink-300">https://cloud.appwrite.io/v1</code> for Appwrite Cloud.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Project ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={appwriteConfig.projectId}
                      onChange={(e) => setAppwriteConfig({ ...appwriteConfig, projectId: e.target.value })}
                      placeholder="e.g. 66e84fa100234..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Database ID
                    </label>
                    <input
                      type="text"
                      required
                      value={appwriteConfig.databaseId}
                      onChange={(e) => setAppwriteConfig({ ...appwriteConfig, databaseId: e.target.value })}
                      placeholder="capventure_db"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Partners Collection ID
                    </label>
                    <input
                      type="text"
                      required
                      value={appwriteConfig.partnersCollectionId}
                      onChange={(e) => setAppwriteConfig({ ...appwriteConfig, partnersCollectionId: e.target.value })}
                      placeholder="partners"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Transactions Collection ID
                    </label>
                    <input
                      type="text"
                      required
                      value={appwriteConfig.transactionsCollectionId}
                      onChange={(e) => setAppwriteConfig({ ...appwriteConfig, transactionsCollectionId: e.target.value })}
                      placeholder="transactions"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Test Feedback */}
                {appwriteTestResult && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    appwriteTestResult.success
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}>
                    {appwriteTestResult.success ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Connected successfully to Appwrite database and collections!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <span>Connection failed: {appwriteTestResult.error}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleTestAppwrite}
                    disabled={isTestingAppwrite}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    {isTestingAppwrite ? 'Testing...' : 'Test Connection'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePushToAppwrite}
                      disabled={isSyncingAppwrite}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
                      title="Upload local database to Appwrite"
                    >
                      {isSyncingAppwrite ? 'Syncing...' : 'Push Local Data to Cloud'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePullFromAppwrite}
                      disabled={isSyncingAppwrite}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-colors"
                      title="Download Appwrite database to local"
                    >
                      Pull from Cloud
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg shadow-md shadow-pink-500/20 transition-all"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>

              {/* Setup Guide in Appwrite Console */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
                  Quick 2-Minute Appwrite Console Setup
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>In your Appwrite Console, create a Database named <code className="text-pink-300">capventure_db</code>.</li>
                  <li>Create collection <strong className="text-white">partners</strong> with attributes:
                    <ul className="list-disc list-inside pl-4 text-slate-400 text-[11px]">
                      <li><code className="text-slate-300">name</code> (String, required)</li>
                      <li><code className="text-slate-300">phone</code>, <code className="text-slate-300">email</code>, <code className="text-slate-300">notes</code>, <code className="text-slate-300">avatarColor</code> (String, optional)</li>
                    </ul>
                  </li>
                  <li>Create collection <strong className="text-white">transactions</strong> with attributes:
                    <ul className="list-disc list-inside pl-4 text-slate-400 text-[11px]">
                      <li><code className="text-slate-300">partnerId</code> (String, required)</li>
                      <li><code className="text-slate-300">date</code> (String, required)</li>
                      <li><code className="text-slate-300">amount</code> (Float, required)</li>
                      <li><code className="text-slate-300">type</code> (String, required)</li>
                      <li><code className="text-slate-300">description</code>, <code className="text-slate-300">paymentMethod</code>, <code className="text-slate-300">reference</code> (String, optional)</li>
                    </ul>
                  </li>
                  <li>Under Collection Settings &gt; Permissions, add <code className="text-pink-300">Any</code> (Read, Create, Update, Delete) or your User role.</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB: Backup & Data */}
          {activeTab === 'storage' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Full Database Backup & Restore
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Export an encrypted, human-readable JSON snapshot of your partners, transactions, and settings.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Download className="h-4 w-4 text-emerald-400" />
                    Download JSON Backup
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-blue-400" />
                    Restore From JSON Backup
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    onClick={onExportCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-teal-400" />
                    Export Ledger (CSV)
                  </button>
                </div>
              </div>

              {/* Data Management Actions */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Sample Data & Factory Reset
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Easily reload test data for demo purposes or clear everything to begin fresh.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleResetDemo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                    Reset to Demo Data
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear All Records
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Free Hosting Guide */}
          {activeTab === 'hosting' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4" />
                  How to Host This Web App Anywhere For 100% Free
                </h3>
                <p className="text-slate-300">
                  Because this is built as a fast, high-performance static SPA (Single Page Application), you can deploy it globally on top CDNs with free custom domains and HTTPS SSL certificates forever.
                </p>
              </div>

              {/* Option A: Vercel */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Option 1: Vercel (Easiest & Recommended)</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Free Forever
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Push this project folder to your GitHub repository (<code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">git push</code>).</li>
                  <li>Go to <strong className="text-slate-200">vercel.com</strong>, log in with GitHub, and click <strong>"Add New Project"</strong>.</li>
                  <li>Select your repository. Vercel will automatically detect Vite and configure the build command (<code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">npm run build</code>).</li>
                  <li>Click <strong>Deploy</strong>. In 30 seconds, you get a live URL (e.g. <code className="text-emerald-400">my-investments.vercel.app</code>) accessible from your phone and computer.</li>
                </ol>
              </div>

              {/* Option B: Netlify / Cloudflare Pages */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">Option 2: Cloudflare Pages or Netlify</span>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    Unlimited Bandwidth
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>In Cloudflare Dashboard, go to <strong>Compute &gt; Workers & Pages &gt; Create application &gt; Pages</strong>.</li>
                  <li>Connect your GitHub repo. Build command: <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">npm run build</code>, Output directory: <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">dist</code>.</li>
                  <li>Instant global deployment with DDOS protection.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB: Supabase Cloud Sync */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <Database className="h-4 w-4" />
                  Free Supabase Cloud Database (PostgreSQL)
                </div>
                <p className="text-xs text-slate-400">
                  Prefer PostgreSQL? Supabase gives you a free 500 MB database forever. Enter your project details below to connect:
                </p>

                <form onSubmit={handleSaveCloudSettings} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzabcdefg.supabase.co"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Supabase Anon / Public Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="useSupabase"
                      checked={useSupabase}
                      onChange={(e) => setUseSupabase(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="useSupabase" className="text-xs text-slate-300 cursor-pointer">
                      Enable Supabase Sync
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Save Supabase Credentials
                    </button>
                  </div>
                </form>
              </div>

              {/* SQL setup schema */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Quick Supabase SQL Setup (1-Click Copy)
                  </span>
                  <button
                    type="button"
                    onClick={copySqlToClipboard}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedSql ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSql ? 'Copied to clipboard!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
