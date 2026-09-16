import { AppSettings, BusinessCustomer, BusinessTransaction, DEFAULT_APPWRITE_CONFIG, DEFAULT_CURRENCIES, Partner, Transaction } from '../types';

const STORAGE_KEYS = {
  PARTNERS: 'capventure_partners_v1',
  TRANSACTIONS: 'capventure_transactions_v1',
  SETTINGS: 'capventure_settings_v1',
  CUSTOMERS: 'capventure_business_customers_v1',
  BUSINESS_TXS: 'capventure_business_txs_v1',
};

export const INITIAL_DEMO_PARTNERS: Partner[] = [
  {
    id: 'partner-1',
    name: 'Rahim Chowdhury (Logistics & Fleet)',
    phone: '+1 555-019-2834',
    email: 'rahim@ventures.com',
    notes: 'Freight & transport fleet investment with 15% quarterly revenue sharing.',
    avatarColor: '#10b981', // emerald
    createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'partner-2',
    name: 'Karim Textiles (Import-Export)',
    phone: '+1 555-014-9921',
    email: 'karim@textiles.biz',
    notes: 'Seasonal fabric inventory financing. Fast cycle returns.',
    avatarColor: '#6366f1', // indigo
    createdAt: '2025-11-15T00:00:00Z',
  },
];

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    partnerId: 'partner-1',
    date: '2025-10-05',
    amount: 10000,
    type: 'INVESTMENT_OUT',
    description: 'Initial seed capital for purchasing 2 light commercial delivery vans',
    paymentMethod: 'Bank Wire',
    reference: 'TXN-00109',
    createdAt: '2025-10-05T10:00:00Z',
  },
  {
    id: 'tx-2',
    partnerId: 'partner-1',
    date: '2025-11-10',
    amount: 1200,
    type: 'PROFIT_PAYOUT',
    description: 'Month 1 logistics routing operational profit share',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-1102',
    createdAt: '2025-11-10T14:30:00Z',
  },
  {
    id: 'tx-3',
    partnerId: 'partner-1',
    date: '2025-12-15',
    amount: 1500,
    type: 'PROFIT_PAYOUT',
    description: 'Month 2 logistics peak season profit payout',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-1215',
    createdAt: '2025-12-15T16:00:00Z',
  },
  {
    id: 'tx-4',
    partnerId: 'partner-1',
    date: '2026-01-10',
    amount: 2500,
    type: 'PRINCIPAL_RETURN',
    description: 'Partial capital return from client retainer settlement',
    paymentMethod: 'Bank Wire',
    reference: 'RET-0110',
    createdAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'tx-5',
    partnerId: 'partner-1',
    date: '2026-01-20',
    amount: 5000,
    type: 'INVESTMENT_OUT',
    description: 'Supplemental capital for new regional courier contract expansion',
    paymentMethod: 'Bank Wire',
    reference: 'TXN-00244',
    createdAt: '2026-01-20T09:15:00Z',
  },
  {
    id: 'tx-6',
    partnerId: 'partner-2',
    date: '2026-02-01',
    amount: 8000,
    type: 'INVESTMENT_OUT',
    description: 'Spring fabric container shipment pre-financing',
    paymentMethod: 'Check deposit',
    reference: 'CHK-8891',
    createdAt: '2026-02-01T13:00:00Z',
  },
  {
    id: 'tx-7',
    partnerId: 'partner-2',
    date: '2026-02-28',
    amount: 1400,
    type: 'PROFIT_PAYOUT',
    description: 'First shipment batch turnover net margin profit payout',
    paymentMethod: 'Online Transfer',
    reference: 'PAY-0228',
    createdAt: '2026-02-28T18:00:00Z',
  },
  {
    id: 'tx-8',
    partnerId: 'partner-1',
    date: '2026-03-05',
    amount: 1850,
    type: 'PROFIT_PAYOUT',
    description: 'Fleet logistics Q1 monthly distribution',
    paymentMethod: 'Bank Wire',
    reference: 'PAY-0305',
    createdAt: '2026-03-05T12:00:00Z',
  },
  {
    id: 'tx-9',
    partnerId: 'partner-2',
    date: '2026-03-12',
    amount: 3000,
    type: 'PRINCIPAL_RETURN',
    description: 'Wholesale clearance proceeds capital payback',
    paymentMethod: 'Online Transfer',
    reference: 'RET-0312',
    createdAt: '2026-03-12T15:30:00Z',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: DEFAULT_CURRENCIES[0], // BDT default (৳)
  appwrite: DEFAULT_APPWRITE_CONFIG,
  useSupabase: false,
  theme: 'dark',
};

// Storage operations
export function getStoredPartners(workspaceId?: string): Partner[] {
  try {
    const key = workspaceId ? `${STORAGE_KEYS.PARTNERS}_${workspaceId}` : STORAGE_KEYS.PARTNERS;
    let raw = localStorage.getItem(key);
    if (!raw && workspaceId) {
      raw = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    }
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredPartners(partners: Partner[], workspaceId?: string): void {
  try {
    const serialized = JSON.stringify(partners);
    localStorage.setItem(STORAGE_KEYS.PARTNERS, serialized);
    if (workspaceId) {
      localStorage.setItem(`${STORAGE_KEYS.PARTNERS}_${workspaceId}`, serialized);
    }
  } catch (err) {
    console.error('Failed to save partners:', err);
  }
}

export function getStoredTransactions(workspaceId?: string): Transaction[] {
  try {
    const key = workspaceId ? `${STORAGE_KEYS.TRANSACTIONS}_${workspaceId}` : STORAGE_KEYS.TRANSACTIONS;
    let raw = localStorage.getItem(key);
    if (!raw && workspaceId) {
      raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    }
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[], workspaceId?: string): void {
  try {
    const serialized = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, serialized);
    if (workspaceId) {
      localStorage.setItem(`${STORAGE_KEYS.TRANSACTIONS}_${workspaceId}`, serialized);
    }
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

// Business Operator Storage operations
export function getStoredCustomers(userId?: string): BusinessCustomer[] {
  try {
    const key = userId ? `${STORAGE_KEYS.CUSTOMERS}_${userId}` : STORAGE_KEYS.CUSTOMERS;
    let raw = localStorage.getItem(key);
    if (!raw && userId) {
      raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    }
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredCustomers(customers: BusinessCustomer[], userId?: string): void {
  try {
    const serialized = JSON.stringify(customers);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, serialized);
    if (userId) {
      localStorage.setItem(`${STORAGE_KEYS.CUSTOMERS}_${userId}`, serialized);
    }
  } catch (err) {
    console.error('Failed to save customers:', err);
  }
}

export function getStoredBusinessTransactions(userId?: string): BusinessTransaction[] {
  try {
    const key = userId ? `${STORAGE_KEYS.BUSINESS_TXS}_${userId}` : STORAGE_KEYS.BUSINESS_TXS;
    let raw = localStorage.getItem(key);
    if (!raw && userId) {
      raw = localStorage.getItem(STORAGE_KEYS.BUSINESS_TXS);
    }
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredBusinessTransactions(transactions: BusinessTransaction[], userId?: string): void {
  try {
    const serialized = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEYS.BUSINESS_TXS, serialized);
    if (userId) {
      localStorage.setItem(`${STORAGE_KEYS.BUSINESS_TXS}_${userId}`, serialized);
    }
  } catch (err) {
    console.error('Failed to save business transactions:', err);
  }
}

export function getStoredSettings(userId?: string): AppSettings {
  try {
    const userKey = userId ? `${STORAGE_KEYS.SETTINGS}_user_${userId}` : null;
    let raw = userKey ? localStorage.getItem(userKey) : null;
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    }
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Resolve currency; default to BDT if none or invalid
    const currency = parsed.currency?.code
      ? DEFAULT_CURRENCIES.find((c) => c.code === parsed.currency.code) || parsed.currency
      : DEFAULT_CURRENCIES[0];

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      currency,
      appwrite: {
        ...DEFAULT_APPWRITE_CONFIG,
        ...(parsed.appwrite || {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings, userId?: string): void {
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, serialized);
    if (userId) {
      localStorage.setItem(`${STORAGE_KEYS.SETTINGS}_user_${userId}`, serialized);
    }
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportBackupJson(): string {
  const data = {
    app: 'CapVenture Business Investment Tracker',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    partners: getStoredPartners(),
    transactions: getStoredTransactions(),
    settings: getStoredSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.partners || !data.transactions) {
      return { success: false, error: 'Invalid backup format: Missing partners or transactions array' };
    }
    saveStoredPartners(data.partners);
    saveStoredTransactions(data.transactions);
    if (data.settings) {
      saveStoredSettings(data.settings);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON file' };
  }
}

export function exportToCsv(transactions: Transaction[], partners: Partner[]): string {
  const partnerMap = new Map(partners.map((p) => [p.id, p.name]));
  
  const headers = ['ID', 'Date', 'Partner', 'Type', 'Amount', 'Expected Profit', 'Expected Return %', 'Target Date', 'Description', 'Payment Method', 'Reference'];
  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${partnerMap.get(t.partnerId) || 'Unknown'}"`,
    `"${t.type}"`,
    t.amount,
    t.expectedProfit !== undefined ? t.expectedProfit : '',
    t.expectedProfitRate !== undefined ? `${t.expectedProfitRate}%` : '',
    `"${t.targetDate || ''}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.reference || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export function triggerDownload(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
