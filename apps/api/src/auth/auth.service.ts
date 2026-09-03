import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole, type UserProfile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { OidcIdentity, SafeUserProfile } from './auth.types';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  async completeLogin(identity: OidcIdentity): Promise<{
    token: string;
    expiresAt: Date;
    user: SafeUserProfile;
  }> {
    const email = identity.email.trim().toLowerCase();
    const linked = await this.prisma.userProfile.findUnique({
      where: { keycloakUserId: identity.subject },
    });
    const emailOwner = await this.prisma.userProfile.findUnique({ where: { email } });
    if (emailOwner && emailOwner.keycloakUserId !== identity.subject) {
      throw new ConflictException('A identidade não pôde ser vinculada ao perfil local.');
    }

    const roleSnapshot = identity.roles.includes('admin') ? UserRole.ADMIN : UserRole.USER;
    const profile = await this.prisma.userProfile.upsert({
      where: { keycloakUserId: identity.subject },
      create: {
        keycloakUserId: identity.subject,
        email,
        name: identity.name,
        roleSnapshot,
      },
      update: {
        email,
        name: identity.name,
        roleSnapshot,
      },
    });

    if (!(linked?.isActiveLocal ?? profile.isActiveLocal)) {
      throw new UnauthorizedException('Acesso não autorizado.');
    }

    const session = await this.sessions.create(profile);
    return { ...session, user: this.safeProfile(profile) };
  }

  private safeProfile(profile: UserProfile): SafeUserProfile {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.roleSnapshot,
    };
  }
}
