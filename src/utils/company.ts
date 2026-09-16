import { AuthUser, CompanyInvitation, CompanyMember, CompanyProfile, CompanyRole, UserRole } from '../types';

const STORAGE_KEYS = {
  COMPANIES: 'capventure_companies_v1',
  INVITATIONS: 'capventure_invitations_v1',
  ACTIVE_COMPANY: 'capventure_active_company_v1',
};

/**
 * Retrieve all stored companies
 */
export function getAllStoredCompanies(): Record<string, CompanyProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save all stored companies
 */
export function saveAllStoredCompanies(companies: Record<string, CompanyProfile>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  } catch (err) {
    console.error('Failed to save companies:', err);
  }
}

/**
 * Retrieve a specific company by ID
 */
export function getStoredCompany(companyId: string): CompanyProfile | null {
  const companies = getAllStoredCompanies();
  return companies[companyId] || null;
}

/**
 * Save or update a company profile
 */
export function saveStoredCompany(company: CompanyProfile): void {
  const companies = getAllStoredCompanies();
  companies[company.id] = company;
  saveAllStoredCompanies(companies);
}

/**
 * Retrieve or automatically initialize a company for a user
 */
export function getOrCreateUserCompany(user: AuthUser): CompanyProfile {
  const companies = getAllStoredCompanies();

  // 1. If user already has a companyId and it exists
  if (user.companyId && companies[user.companyId]) {
    return companies[user.companyId];
  }

  // 2. Check if user is owner or member of any existing company
  const existing = Object.values(companies).find(
    (c) => c.ownerId === user.id || c.members.some((m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase())
  );
  if (existing) {
    return existing;
  }

  // 3. Otherwise create a default company for the user
  const defaultName = user.name ? `${user.name}'s Organization` : 'My Organization';
  const newCompany: CompanyProfile = {
    id: `comp_${user.id}`,
    name: defaultName,
    type: user.role || 'INVESTOR',
    ownerId: user.id,
    ownerEmail: user.email,
    members: [
      {
        userId: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        companyRole: 'OWNER',
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  saveStoredCompany(newCompany);
  return newCompany;
}

/**
 * Retrieve all invitations
 */
export function getAllStoredInvitations(): CompanyInvitation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save all invitations
 */
export function saveAllStoredInvitations(invitations: CompanyInvitation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  } catch (err) {
    console.error('Failed to save invitations:', err);
  }
}

/**
 * List invitations for a specific company
 */
export function getCompanyInvitations(companyId: string): CompanyInvitation[] {
  const all = getAllStoredInvitations();
  return all.filter((inv) => inv.companyId === companyId);
}

/**
 * Create and save a new company invitation
 */
export function createInvitation(
  company: CompanyProfile,
  inviter: AuthUser,
  invitedEmail: string,
  targetRole: UserRole,
  companyRole: CompanyRole = 'MEMBER'
): CompanyInvitation {
  const all = getAllStoredInvitations();
  const normalizedEmail = invitedEmail.trim().toLowerCase();

  // Create unique token and ID
  const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const invitation: CompanyInvitation = {
    id: `invite_${Date.now()}`,
    companyId: company.id,
    companyName: company.name,
    invitedEmail: normalizedEmail,
    invitedByUserId: inviter.id,
    invitedByName: inviter.name || inviter.email,
    companyRole,
    targetRole,
    token,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  // Remove any previous pending invite to the same email in this company
  const filtered = all.filter(
    (i) => !(i.companyId === company.id && i.invitedEmail === normalizedEmail && i.status === 'PENDING')
  );
  filtered.push(invitation);
  saveAllStoredInvitations(filtered);

  return invitation;
}

/**
 * Find an invitation by its token
 */
export function findInvitationByToken(token: string): CompanyInvitation | null {
  if (!token) return null;
  const all = getAllStoredInvitations();
  return all.find((i) => i.token === token && i.status === 'PENDING') || null;
}

/**
 * Find pending invitation matching an email address
 */
export function findPendingInvitationForEmail(email: string): CompanyInvitation | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const all = getAllStoredInvitations();
  return all.find((i) => i.invitedEmail.toLowerCase() === normalized && i.status === 'PENDING') || null;
}

/**
 * Accept an invitation and bind the user to the company
 */
export function acceptInvitation(
  invitationIdentifier: string, // token or invitationId
  user: AuthUser
): { success: boolean; company?: CompanyProfile; error?: string } {
  const all = getAllStoredInvitations();
  const invite = all.find(
    (i) => (i.id === invitationIdentifier || i.token === invitationIdentifier) && i.status === 'PENDING'
  );

  if (!invite) {
    return { success: false, error: 'Invitation is invalid or has already been accepted.' };
  }

  const company = getStoredCompany(invite.companyId);
  if (!company) {
    return { success: false, error: 'Target organization or company not found.' };
  }

  // Update invite status
  invite.status = 'ACCEPTED';
  saveAllStoredInvitations(all);

  // Add member if not already present
  const alreadyMember = company.members.some(
    (m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase()
  );

  if (!alreadyMember) {
    const newMember: CompanyMember = {
      userId: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      companyRole: invite.companyRole,
      joinedAt: new Date().toISOString(),
    };
    company.members.push(newMember);
    saveStoredCompany(company);
  }

  return { success: true, company };
}

/**
 * Revoke or cancel an invitation
 */
export function revokeInvitation(invitationId: string): void {
  const all = getAllStoredInvitations();
  const updated = all.filter((i) => i.id !== invitationId);
  saveAllStoredInvitations(updated);
}

/**
 * Generate a shareable URL with the invitation token
 */
export function getShareableInviteLink(token: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return `${origin}${pathname}?invite=${encodeURIComponent(token)}`;
}
