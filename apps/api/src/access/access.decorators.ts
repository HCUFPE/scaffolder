import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { ResolvedSession, SafeUserProfile } from '../auth/auth.types';

export const IS_PUBLIC_KEY = 'appstart:is-public';
export const REQUIRED_ROLES_KEY = 'appstart:required-roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: UserRole[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ResolvedSession | undefined =>
    context.switchToHttp().getRequest().auth,
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SafeUserProfile | undefined =>
    context.switchToHttp().getRequest().auth?.user,
);
