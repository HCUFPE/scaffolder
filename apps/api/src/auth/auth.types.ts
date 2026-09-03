import type { UserRole } from '@prisma/client';

export interface OidcIdentity {
  subject: string;
  email: string;
  name: string;
  roles: string[];
}

export interface SafeUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ResolvedSession {
  id: string;
  userProfileId: string;
  tokenHash: string;
  user: SafeUserProfile;
}
