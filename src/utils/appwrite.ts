import { Client, Databases, Account, ID, Query } from 'appwrite';
import { AppwriteConfig, AuthUser, CompanyInvitation, CompanyProfile, CompanyRole, Partner, Transaction, UserRole } from '../types';

let cachedClient: Client | null = null;
let cachedEndpoint = '';
let cachedProjectId = '';

export function getClient(config: AppwriteConfig): Client {
  if (
    !cachedClient ||
    cachedEndpoint !== config.endpoint ||
    cachedProjectId !== config.projectId
  ) {
    const client = new Client();
    client.setEndpoint(config.endpoint || 'https://cloud.appwrite.io/v1');
    client.setProject(config.projectId);
    cachedClient = client;
    cachedEndpoint = config.endpoint;
    cachedProjectId = config.projectId;
  }
  return cachedClient;
}

export function getAccount(config: AppwriteConfig): Account {
  return new Account(getClient(config));
}

function getDatabases(config: AppwriteConfig): Databases {
  return new Databases(getClient(config));
}

/**
 * Retrieve the currently logged in Appwrite user (or null if unauthenticated)
 */
export async function getCurrentAppwriteUser(config: AppwriteConfig): Promise<AuthUser | null> {
  if (!config.endpoint || !config.projectId) return null;
  try {
    const account = getAccount(config);
    const user = await account.get();
    let userRole: UserRole = 'INVESTOR';
    let companyId: string | undefined = undefined;
    let companyName: string | undefined = undefined;
    let companyRole: CompanyRole | undefined = undefined;
    try {
      const prefs = await account.getPrefs();
      if ((prefs as any)?.role) userRole = (prefs as any).role;
      if ((prefs as any)?.companyId) companyId = (prefs as any).companyId;
      if ((prefs as any)?.companyName) companyName = (prefs as any).companyName;
      if ((prefs as any)?.companyRole) companyRole = (prefs as any).companyRole;
    } catch {
      // ignore
    }
    return {
      id: user.$id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: userRole,
      companyId,
      companyName,
      companyRole,
    };
  } catch {
    return null;
  }
}

/**
 * Sign in using email and password
 */
export async function loginWithAppwrite(
  config: AppwriteConfig,
  email: string,
  password: string
): Promise<AuthUser> {
  const account = getAccount(config);
  try {
    try {
      await account.deleteSession('current');
    } catch {
      // ignore if no active session
    }
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return {
      id: user.$id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
    };
  } catch (err: any) {
    console.error('Appwrite login error:', err);
    throw new Error(err.message || 'Invalid email or password');
  }
}

/**
 * Sign up a new user and log them in
 */
export async function signupWithAppwrite(
  config: AppwriteConfig,
  name: string,
  email: string,
  password: string,
  role?: UserRole
): Promise<AuthUser> {
  const account = getAccount(config);
  try {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const assignedRole = role || 'INVESTOR';
    try {
      await account.updatePrefs({ role: assignedRole, currencyCode: 'BDT', theme: 'dark' });
    } catch {
      // ignore
    }
    const user = await account.get();
    return {
      id: user.$id,
      name: user.name || name,
      email: user.email,
      role: assignedRole,
    };
  } catch (err: any) {
    console.error('Appwrite signup error:', err);
    throw new Error(err.message || 'Failed to create account. Please verify your details.');
  }
}

/**
 * Logout current device session
 */
export async function logoutAppwrite(config: AppwriteConfig): Promise<void> {
  try {
    const account = getAccount(config);
    await account.deleteSession('current');
  } catch (err) {
    console.warn('Logout warning:', err);
  }
}

/**
 * Retrieve user account preferences (theme, currencyCode, role, company, etc.) from Appwrite
 */
export async function fetchUserPreferences(
  config: AppwriteConfig
): Promise<{
  theme?: 'dark' | 'light';
  currencyCode?: string;
  role?: UserRole;
  companyId?: string;
  companyName?: string;
  companyRole?: CompanyRole;
} | null> {
  if (!config.endpoint || !config.projectId) return null;
  try {
    const account = getAccount(config);
    const prefs = await account.getPrefs();
    return prefs as {
      theme?: 'dark' | 'light';
      currencyCode?: string;
      role?: UserRole;
      companyId?: string;
      companyName?: string;
      companyRole?: CompanyRole;
    };
  } catch (err) {
    console.warn('Could not fetch user preferences from Appwrite:', err);
    return null;
  }
}

/**
 * Save user account preferences (theme, currencyCode, role, company, etc.) to Appwrite
 */
export async function saveUserPreferences(
  config: AppwriteConfig,
  prefs: {
    theme?: 'dark' | 'light';
    currencyCode?: string;
    role?: UserRole;
    companyId?: string;
    companyName?: string;
    companyRole?: CompanyRole;
  }
): Promise<void> {
  if (!config.endpoint || !config.projectId) return;
  try {
    const account = getAccount(config);
    const current = await account.getPrefs();
    await account.updatePrefs({ ...current, ...prefs });
  } catch (err) {
    console.warn('Could not save user preferences to Appwrite:', err);
  }
}

export function isAppwriteConfigured(config?: AppwriteConfig): boolean {
  return Boolean(
    config &&
    config.enabled &&
    config.endpoint?.trim() &&
    config.projectId?.trim() &&
    config.databaseId?.trim() &&
    config.partnersCollectionId?.trim() &&
    config.transactionsCollectionId?.trim()
  );
}

/**
 * Test connectivity with Appwrite Database
 */
export async function testAppwriteConnection(config: AppwriteConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const databases = getDatabases(config);
    // Try listing documents with limit 1 to check permissions and existence
    await databases.listDocuments(
      config.databaseId,
      config.partnersCollectionId,
      [Query.limit(1)]
    );
    return { success: true };
  } catch (err: any) {
    console.error('Appwrite connection test failed:', err);
    return {
      success: false,
      error: err.message || 'Failed to connect to Appwrite. Check your Project ID, Database ID, and Collection Permissions.',
    };
  }
}

/**
 * Fetch all partners from Appwrite
 */
export async function fetchPartnersFromAppwrite(config: AppwriteConfig): Promise<Partner[]> {
  const databases = getDatabases(config);
  const response = await databases.listDocuments(
    config.databaseId,
    config.partnersCollectionId,
    [Query.limit(100)]
  );

  return response.documents
    .filter((doc: any) => !doc.$id.startsWith('co_'))
    .map((doc: any) => ({
      id: doc.$id,
      name: doc.name || '',
      phone: doc.phone || undefined,
      email: doc.email || undefined,
      notes: doc.notes || undefined,
      avatarColor: doc.avatarColor || '#10b981',
      createdAt: doc.$createdAt || new Date().toISOString(),
    }));
}

/**
 * Save (create or update) a partner in Appwrite
 */
export async function savePartnerToAppwrite(config: AppwriteConfig, partner: Partner): Promise<void> {
  const databases = getDatabases(config);
  const payload = {
    name: partner.name,
    phone: partner.phone || '',
    email: partner.email || '',
    notes: partner.notes || '',
    avatarColor: partner.avatarColor || '#10b981',
  };

  try {
    // Try updating existing document first
    await databases.updateDocument(
      config.databaseId,
      config.partnersCollectionId,
      partner.id,
      payload
    );
  } catch (updateErr: any) {
    // If not found, create new document with partner.id
    if (updateErr.code === 404 || updateErr.message?.includes('not found')) {
      await databases.createDocument(
        config.databaseId,
        config.partnersCollectionId,
        partner.id,
        payload
      );
    } else {
      throw updateErr;
    }
  }
}

/**
 * Delete a partner from Appwrite
 */
export async function deletePartnerFromAppwrite(config: AppwriteConfig, partnerId: string): Promise<void> {
  const databases = getDatabases(config);
  await databases.deleteDocument(
    config.databaseId,
    config.partnersCollectionId,
    partnerId
  );
}

/**
 * Fetch all transactions from Appwrite
 */
export async function fetchTransactionsFromAppwrite(config: AppwriteConfig): Promise<Transaction[]> {
  const databases = getDatabases(config);
  const response = await databases.listDocuments(
    config.databaseId,
    config.transactionsCollectionId,
    [Query.limit(500)]
  );

  return response.documents.map((doc: any) => ({
    id: doc.$id,
    partnerId: doc.partnerId || '',
    date: doc.date || '',
    amount: Number(doc.amount) || 0,
    type: doc.type as any,
    description: doc.description || '',
    paymentMethod: doc.paymentMethod || '',
    reference: doc.reference || '',
    expectedProfit: doc.expectedProfit !== undefined && doc.expectedProfit !== null ? Number(doc.expectedProfit) : undefined,
    expectedProfitRate: doc.expectedProfitRate !== undefined && doc.expectedProfitRate !== null ? Number(doc.expectedProfitRate) : undefined,
    targetDate: doc.targetDate || undefined,
    profitResolved: Boolean(doc.profitResolved),
    relatedTxId: doc.relatedTxId || undefined,
    createdAt: doc.$createdAt || new Date().toISOString(),
  }));
}

/**
 * Save (create or update) a transaction in Appwrite
 */
export async function saveTransactionToAppwrite(config: AppwriteConfig, transaction: Transaction): Promise<void> {
  const databases = getDatabases(config);
  const payload: any = {
    partnerId: transaction.partnerId,
    date: transaction.date,
    amount: Number(transaction.amount),
    type: transaction.type,
    description: transaction.description || '',
    paymentMethod: transaction.paymentMethod || '',
    reference: transaction.reference || '',
    expectedProfit: transaction.expectedProfit ? Number(transaction.expectedProfit) : null,
    expectedProfitRate: transaction.expectedProfitRate ? Number(transaction.expectedProfitRate) : null,
    targetDate: transaction.targetDate || null,
    profitResolved: Boolean(transaction.profitResolved),
    relatedTxId: transaction.relatedTxId || null,
  };

  try {
    await databases.updateDocument(
      config.databaseId,
      config.transactionsCollectionId,
      transaction.id,
      payload
    );
  } catch (updateErr: any) {
    if (updateErr.code === 404 || updateErr.message?.includes('not found')) {
      await databases.createDocument(
        config.databaseId,
        config.transactionsCollectionId,
        transaction.id,
        payload
      );
    } else {
      throw updateErr;
    }
  }
}

/**
 * Delete a transaction from Appwrite
 */
export async function deleteTransactionFromAppwrite(config: AppwriteConfig, transactionId: string): Promise<void> {
  const databases = getDatabases(config);
  await databases.deleteDocument(
    config.databaseId,
    config.transactionsCollectionId,
    transactionId
  );
}

/**
 * Delete multiple transactions from Appwrite
 */
export async function deleteMultipleTransactionsFromAppwrite(
  config: AppwriteConfig,
  transactionIds: string[]
): Promise<void> {
  const databases = getDatabases(config);
  await Promise.all(
    transactionIds.map((id) =>
      databases.deleteDocument(
        config.databaseId,
        config.transactionsCollectionId,
        id
      )
    )
  );
}

/**
 * Sync all local data to Appwrite
 */
export async function syncLocalToAppwrite(
  config: AppwriteConfig,
  partners: Partner[],
  transactions: Transaction[]
): Promise<{ success: boolean; error?: string }> {
  try {
    for (const p of partners) {
      await savePartnerToAppwrite(config, p);
    }
    for (const t of transactions) {
      await saveTransactionToAppwrite(config, t);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sync failed' };
  }
}

/**
 * Sanitize company ID to fit Appwrite document ID requirements (max 36 chars, alphanumeric/dash/underscore, starts with a-z)
 */
export function getCompanyDocId(companyId: string): string {
  const clean = companyId.replace(/[^a-zA-Z0-9_]/g, '_');
  const docId = clean.startsWith('comp_') ? clean.replace(/^comp_/, 'co_') : `co_${clean}`;
  return docId.substring(0, 36);
}

/**
 * Save Company Profile & Invitations to Appwrite
 */
export async function saveCompanyToAppwrite(
  config: AppwriteConfig,
  company: CompanyProfile,
  invitations: CompanyInvitation[]
): Promise<void> {
  if (!isAppwriteConfigured(config)) return;
  const databases = getDatabases(config);
  const docId = getCompanyDocId(company.id);

  const payload = {
    name: `[ORG] ${company.name}`.substring(0, 100),
    phone: '',
    email: company.ownerEmail || '',
    notes: JSON.stringify({ company, invitations }),
    avatarColor: '#10b981',
  };

  try {
    await databases.updateDocument(
      config.databaseId,
      config.partnersCollectionId,
      docId,
      payload
    );
  } catch (updateErr: any) {
    if (updateErr.code === 404 || updateErr.message?.includes('not found')) {
      try {
        await databases.createDocument(
          config.databaseId,
          config.partnersCollectionId,
          docId,
          payload
        );
      } catch (createErr) {
        console.warn('Could not create company doc in Appwrite:', createErr);
      }
    } else {
      console.warn('Could not update company doc in Appwrite:', updateErr);
    }
  }
}

/**
 * Fetch Company Profile & Invitations from Appwrite
 */
export async function fetchCompanyFromAppwrite(
  config: AppwriteConfig,
  companyId: string
): Promise<{ company: CompanyProfile; invitations: CompanyInvitation[] } | null> {
  if (!isAppwriteConfigured(config)) return null;
  const databases = getDatabases(config);
  const docId = getCompanyDocId(companyId);

  try {
    const doc = await databases.getDocument(
      config.databaseId,
      config.partnersCollectionId,
      docId
    );
    if (doc.notes) {
      const parsed = JSON.parse(doc.notes);
      if (parsed.company) {
        return {
          company: parsed.company,
          invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [],
        };
      }
    }
  } catch (err: any) {
    if (err.code !== 404 && !err.message?.includes('not found')) {
      console.warn('Could not fetch company doc from Appwrite:', err);
    }
  }
  return null;
}

/**
 * Scan all companies in Appwrite to find a pending invitation for a specific email
 */
export async function findPendingInvitationInAppwrite(
  config: AppwriteConfig,
  email: string
): Promise<{ company: CompanyProfile; invitation: CompanyInvitation } | null> {
  if (!isAppwriteConfigured(config) || !email) return null;
  const databases = getDatabases(config);
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.partnersCollectionId,
      [Query.limit(100)]
    );

    for (const doc of response.documents) {
      if (doc.$id.startsWith('co_') && doc.notes) {
        try {
          const parsed = JSON.parse(doc.notes);
          if (parsed.company && Array.isArray(parsed.invitations)) {
            const foundInvite = parsed.invitations.find(
              (inv: CompanyInvitation) =>
                inv.invitedEmail.trim().toLowerCase() === normalizedEmail && inv.status === 'PENDING'
            );
            if (foundInvite) {
              return {
                company: parsed.company,
                invitation: foundInvite,
              };
            }
          }
        } catch {
          // ignore non-json notes
        }
      }
    }
  } catch (err) {
    console.warn('Error querying Appwrite for pending invitations:', err);
  }
  return null;
}

