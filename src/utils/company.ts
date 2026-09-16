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
 * Create a self-contained token that can be decoded on any machine/browser
 */
export function encodeInviteToken(data: {
  id: string;
  companyId: string;
  companyName: string;
  invitedEmail: string;
  invitedByUserId: string;
  invitedByName: string;
  companyRole: CompanyRole;
  targetRole: UserRole;
  createdAt: string;
}): string {
  try {
    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `inv_${base64}`;
  } catch {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Decode a self-contained token from URL
 */
export function decodeInviteToken(token: string): CompanyInvitation | null {
  if (!token || !token.startsWith('inv_')) return null;
  const raw = token.substring(4);
  try {
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    if (parsed.companyId && parsed.invitedEmail) {
      return {
        id: parsed.id || `invite_${Date.now()}`,
        companyId: parsed.companyId,
        companyName: parsed.companyName || 'Organization',
        invitedEmail: parsed.invitedEmail.toLowerCase(),
        invitedByUserId: parsed.invitedByUserId || '',
        invitedByName: parsed.invitedByName || '',
        companyRole: parsed.companyRole || 'MEMBER',
        targetRole: parsed.targetRole || 'INVESTOR',
        token,
        status: 'PENDING',
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    }
  } catch {
    // If not base64 encoded token, fallback
  }
  return null;
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
  const inviteId = `invite_${Date.now()}`;
  const createdAt = new Date().toISOString();

  // Create self-contained token that works cross-device / cross-browser
  const token = encodeInviteToken({
    id: inviteId,
    companyId: company.id,
    companyName: company.name,
    invitedEmail: normalizedEmail,
    invitedByUserId: inviter.id,
    invitedByName: inviter.name || inviter.email,
    companyRole,
    targetRole,
    createdAt,
  });

  const invitation: CompanyInvitation = {
    id: inviteId,
    companyId: company.id,
    companyName: company.name,
    invitedEmail: normalizedEmail,
    invitedByUserId: inviter.id,
    invitedByName: inviter.name || inviter.email,
    companyRole,
    targetRole,
    token,
    status: 'PENDING',
    createdAt,
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
  const local = all.find((i) => i.token === token && i.status === 'PENDING');
  if (local) return local;

  // Try decoding self-contained token (for other browsers / incognito)
  const decoded = decodeInviteToken(token);
  if (decoded) {
    const existing = all.find((i) => i.id === decoded.id || i.token === token);
    if (!existing) {
      all.push(decoded);
      saveAllStoredInvitations(all);
    }
    const existingCompany = getStoredCompany(decoded.companyId);
    if (!existingCompany) {
      const stubCompany: CompanyProfile = {
        id: decoded.companyId,
        name: decoded.companyName,
        type: decoded.targetRole,
        ownerId: decoded.invitedByUserId,
        ownerEmail: '',
        members: [
          {
            userId: decoded.invitedByUserId,
            name: decoded.invitedByName,
            email: '',
            companyRole: 'OWNER',
            joinedAt: decoded.createdAt,
          },
        ],
        createdAt: decoded.createdAt,
      };
      saveStoredCompany(stubCompany);
    }
    return decoded;
  }

  return null;
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
  let invite = all.find(
    (i) => (i.id === invitationIdentifier || i.token === invitationIdentifier) && i.status === 'PENDING'
  );

  // If not found in local storage, try decoding if it is a token
  if (!invite) {
    invite = decodeInviteToken(invitationIdentifier) || undefined;
  }

  if (!invite) {
    return { success: false, error: 'Invitation is invalid or has already been accepted.' };
  }

  let company = getStoredCompany(invite.companyId);
  if (!company) {
    // Create company from invite metadata if missing
    company = {
      id: invite.companyId,
      name: invite.companyName,
      type: invite.targetRole,
      ownerId: invite.invitedByUserId,
      ownerEmail: '',
      members: [
        {
          userId: invite.invitedByUserId,
          name: invite.invitedByName,
          email: '',
          companyRole: 'OWNER',
          joinedAt: invite.createdAt,
        },
      ],
      createdAt: invite.createdAt,
    };
  }

  // Update invite status
  invite.status = 'ACCEPTED';
  const existingIdx = all.findIndex((i) => i.id === invite!.id);
  if (existingIdx >= 0) {
    all[existingIdx] = invite;
  } else {
    all.push(invite);
  }
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
  }
  saveStoredCompany(company);

  return { success: true, company };
}

/**
 * Directly confirm an invitation and add the invited email as an active member (used by Owner/Admin in UI)
 */
export function confirmMemberJoin(
  companyId: string,
  invitationId: string,
  userName?: string
): { success: boolean; company?: CompanyProfile; error?: string } {
  const all = getAllStoredInvitations();
  const invite = all.find((i) => i.id === invitationId && i.companyId === companyId);
  if (!invite) {
    return { success: false, error: 'Invitation not found.' };
  }

  const company = getStoredCompany(companyId);
  if (!company) {
    return { success: false, error: 'Company not found.' };
  }

  invite.status = 'ACCEPTED';
  saveAllStoredInvitations(all);

  const existingMember = company.members.find(
    (m) => m.email.toLowerCase() === invite.invitedEmail.toLowerCase()
  );

  if (!existingMember) {
    company.members.push({
      userId: `user_${invite.invitedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: userName || invite.invitedEmail.split('@')[0],
      email: invite.invitedEmail,
      companyRole: invite.companyRole,
      joinedAt: new Date().toISOString(),
    });
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

/**
 * Remove a user from the organization (Owner only)
 */
export function removeMemberFromCompany(
  companyId: string,
  memberUserIdOrEmail: string,
  requesterUserId: string
): { success: boolean; company?: CompanyProfile; error?: string } {
  const company = getStoredCompany(companyId);
  if (!company) {
    return { success: false, error: 'Organization not found.' };
  }

  // Enforce: Owner only can remove members
  if (company.ownerId !== requesterUserId) {
    return { success: false, error: 'Only the organization owner can remove members.' };
  }

  const normalizedIdentifier = memberUserIdOrEmail.trim().toLowerCase();

  // Find member
  const member = company.members.find(
    (m) =>
      m.userId === memberUserIdOrEmail ||
      m.email.toLowerCase() === normalizedIdentifier
  );

  if (!member) {
    return { success: false, error: 'Member not found in organization.' };
  }

  // Prevent owner from removing themselves or another owner
  if (member.userId === company.ownerId || member.companyRole === 'OWNER') {
    return { success: false, error: 'The organization owner cannot be removed.' };
  }

  // Filter out member
  company.members = company.members.filter(
    (m) =>
      m.userId !== member.userId &&
      m.email.toLowerCase() !== member.email.toLowerCase()
  );
  saveStoredCompany(company);

  // Also revoke any invitations for this email
  const allInv = getAllStoredInvitations();
  const updatedInv = allInv.map((inv) =>
    inv.companyId === companyId &&
    inv.invitedEmail.toLowerCase() === member.email.toLowerCase()
      ? { ...inv, status: 'REVOKED' as const }
      : inv
  );
  saveAllStoredInvitations(updatedInv);

  return { success: true, company };
}
