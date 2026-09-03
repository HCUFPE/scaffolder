import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KeycloakAdminService } from './keycloak-admin.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [KeycloakAdminService, UserService],
  exports: [UserService],
})
export class UserModule {}
