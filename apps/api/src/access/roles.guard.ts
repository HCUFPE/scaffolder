import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@prisma/client';
import { REQUIRED_ROLES_KEY } from './access.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(REQUIRED_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const user = context.switchToHttp().getRequest().auth?.user;
    if (!user) throw new UnauthorizedException('Autenticação necessária.');
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Você não possui permissão para acessar este recurso.');
    }
    return true;
  }
}
