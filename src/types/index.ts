export type TransactionType = 
  | 'INVESTMENT_OUT'    // Capital you invested / handed over
  | 'PRINCIPAL_RETURN'   // Capital returned by partner (reduces principal)
  | 'PROFIT_PAYOUT'      // Profit paid to you (does not reduce principal)
  | 'REINVEST';          // Profit rolled directly back into principal

export interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  partnerId: string;
  date: string; // ISO string or YYYY-MM-DD
  amount: number;
  type: TransactionType;
  description: string;
  paymentMethod?: string;
  reference?: string;
  createdAt: string;
}

export interface TransactionWithRunningBalance extends Transaction {
  runningPrincipal: number;
  runningProfit: number;
  partnerName: string;
}

export interface FinancialSummary {
  totalInvested: number;
  totalPrincipalReturned: number;
  activeCapital: number; // Principal currently with partner
  totalProfitRealized: number;
  netCashFlow: number; // (Returned + Profit) - Invested
  roiPercentage: number; // (Total Profit / Total Invested) * 100
  recoveryPercentage: number; // (Returned + Profit) / Invested * 100
  isBreakEvenReached: boolean;
  transactionCount: number;
}

export interface MonthlyDataPoint {
  monthKey: string; // YYYY-MM
  label: string;
  invested: number;
  returned: number;
  profit: number;
  netCash: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rate?: number;
}

export const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka (৳)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal (SAR)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AU$)' },
];

export interface AppwriteConfig {
  enabled: boolean;
  endpoint: string; // e.g. https://cloud.appwrite.io/v1
  projectId: string;
  databaseId: string; // e.g. capventure_db
  partnersCollectionId: string; // e.g. partners
  transactionsCollectionId: string; // e.g. transactions
}

export const DEFAULT_APPWRITE_CONFIG: AppwriteConfig = {
  enabled: true,
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  projectId: '6aaa42010035bb510e38',
  databaseId: '6aaa45b70030ed2bdc7c',
  partnersCollectionId: 'partners',
  transactionsCollectionId: 'transactions',
};

export interface AppSettings {
  currency: CurrencyConfig;
  appwrite: AppwriteConfig;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useSupabase: boolean;
  theme: 'dark' | 'light';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

