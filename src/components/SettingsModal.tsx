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
  Globe
} from 'lucide-react';
import { AppSettings } from '../types';
import { 
  exportBackupJson, 
  importBackupJson, 
  triggerDownload, 
  INITIAL_DEMO_PARTNERS, 
  INITIAL_DEMO_TRANSACTIONS, 
  saveStoredPartners, 
  saveStoredTransactions,
  saveStoredSettings
} from '../utils/storage';

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
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '');
  const [useSupabase, setUseSupabase] = useState(settings.useSupabase || false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'storage' | 'hosting' | 'cloud'>('storage');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    alert('Cloud sync settings saved successfully!');
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
  type text not null, -- 'INVESTMENT_OUT', 'PRINCIPAL_RETURN', 'PROFIT_PAYOUT', 'REINVEST'
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
            <h2 className="text-lg font-bold text-white">App Settings & Cloud Hosting</h2>
            <p className="text-xs text-slate-400">Data backup, free hosting guide, and cloud synchronization</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'storage'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💾 Backup & Data
          </button>
          <button
            onClick={() => setActiveTab('hosting')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'hosting'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 Free Hosting Guide
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'cloud'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ☁️ Supabase Cloud Sync
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          
          {/* TAB 1: Backup & Data */}
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

          {/* TAB 2: Free Hosting Guide */}
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
                  <li>Push this project folder to a free GitHub repository (<code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">git push</code>).</li>
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

          {/* TAB 3: Supabase Cloud Sync */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <Database className="h-4 w-4" />
                  Free Supabase Cloud Database (Multi-Device Sync)
                </div>
                <p className="text-xs text-slate-400">
                  Want your phone and computer to always stay synchronized automatically? Supabase gives you a free 500 MB PostgreSQL database forever. Enter your project details below to connect:
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
                      Enable Cloud Sync (Sync transactions & partners with this Supabase database)
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Save Cloud Credentials
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
