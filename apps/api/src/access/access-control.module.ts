import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { AdminAccessController } from './admin-access.controller';
import { RolesGuard } from './roles.guard';
import { SessionAuthGuard } from './session-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminAccessController],
  providers: [
    SessionAuthGuard,
    RolesGuard,
    CsrfGuard,
    { provide: APP_GUARD, useExisting: SessionAuthGuard },
    { provide: APP_GUARD, useExisting: RolesGuard },
    { provide: APP_GUARD, useExisting: CsrfGuard },
  ],
  exports: [SessionAuthGuard, RolesGuard, CsrfGuard],
})
export class AccessControlModule {}
