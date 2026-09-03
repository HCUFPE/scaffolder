import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import type { SafeUserProfile } from './auth.types';

export class SafeUserProfileDto implements SafeUserProfile {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'ada@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;
}

export class AuthMeResponseDto {
  @ApiProperty({ type: () => SafeUserProfileDto })
  user!: SafeUserProfileDto;
}

export class LoginRequestDto {
  @ApiProperty({ example: 'admin@appstart.internal', description: 'E-mail ou nome de usuário cadastrado' })
  @IsString({ message: 'Identificador de usuário deve ser um texto válido.' })
  @IsNotEmpty({ message: 'E-mail ou usuário é obrigatório.' })
  @MaxLength(254, { message: 'Identificador não pode exceder 254 caracteres.' })
  username!: string;

  @ApiProperty({ example: 'Admin123!', description: 'Senha de acesso' })
  @IsString({ message: 'Senha deve ser um texto válido.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(1, { message: 'Senha é obrigatória.' })
  @MaxLength(128, { message: 'Senha não pode exceder 128 caracteres.' })
  password!: string;
}
