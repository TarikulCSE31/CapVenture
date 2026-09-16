import { Client, Databases, Account, ID, Query } from 'appwrite';
import { AppwriteConfig, AuthUser, Partner, Transaction } from '../types';

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
    return {
      id: user.$id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
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
  password: string
): Promise<AuthUser> {
  const account = getAccount(config);
  try {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return {
      id: user.$id,
      name: user.name || name,
      email: user.email,
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

  return response.documents.map((doc: any) => ({
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
