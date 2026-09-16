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
  expectedProfit?: number; // Expected profit in currency
  expectedProfitRate?: number; // Expected return rate in %
  targetDate?: string; // Target payout or maturity date
  profitResolved?: boolean; // True when expected profit has been received
  relatedTxId?: string; // Link to parent investment or related transaction
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
  totalExpectedProfit: number; // Expected total profit from capital advances
  pendingExpectedProfit: number; // Unresolved expected profit
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
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka (৳)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
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

export type UserRole = 'INVESTOR' | 'BUSINESS_OPERATOR';

export interface AppSettings {
  currency: CurrencyConfig;
  appwrite: AppwriteConfig;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useSupabase: boolean;
  theme: 'dark' | 'light';
  activeRole?: UserRole;
}

export type CompanyRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface CompanyMember {
  userId: string;
  name: string;
  email: string;
  companyRole: CompanyRole;
  joinedAt: string;
}

export interface CompanyInvitation {
  id: string;
  companyId: string;
  companyName: string;
  invitedEmail: string;
  invitedByUserId: string;
  invitedByName: string;
  companyRole: CompanyRole;
  targetRole: UserRole;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  type: UserRole;
  ownerId: string;
  ownerEmail: string;
  members: CompanyMember[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  companyId?: string;
  companyName?: string;
  companyRole?: CompanyRole;
}

// -------------------------------------------------------------
// BUSINESS OPERATOR DATA MODELS (Customers, Sales, Dues, Payments)
// -------------------------------------------------------------

export interface BusinessCustomer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  avatarColor?: string;
  createdAt: string;
}

export type BusinessTransactionType = 
  | 'SALE'              // Direct cash sale (fully paid)
  | 'CREDIT_SALE'       // Sale with due balance (partial or zero payment)
  | 'PAYMENT_RECEIVED'  // Due collection payment from customer
  | 'EXPENSE';          // Business operating expense

export interface BusinessTransaction {
  id: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  date: string;
  type: BusinessTransactionType;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash/Nagad' | 'Check' | 'Other';
  description: string;
  reference?: string; // Invoice # or receipt #
  createdAt: string;
}

export interface CustomerWithBalance extends BusinessCustomer {
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  transactionCount: number;
  lastTransactionDate?: string;
}

export interface BusinessSummary {
  totalSales: number;
  totalCashCollected: number;
  totalCustomerDue: number;
  totalExpenses: number;
  netOperatingProfit: number;
  transactionCount: number;
  customerCount: number;
}

