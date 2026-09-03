import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { SafeUserProfile } from '../auth/auth.types';
import { CurrentUser, Roles } from './access.decorators';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminAccessController {
  @Get('access-check')
  check(@CurrentUser() user: SafeUserProfile): { allowed: true; userId: string } {
    return { allowed: true, userId: user.id };
  }
}
