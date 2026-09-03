import type { UserProfile, UserRole } from '@prisma/client';

export interface ManagedUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toManagedUser(profile: UserProfile): ManagedUserDto {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.roleSnapshot,
    isActive: profile.isActiveLocal,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
