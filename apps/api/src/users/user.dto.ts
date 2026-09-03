import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'Ada Lovelace', minLength: 2, maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Nome deve ser um texto.' })
  @MinLength(2, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  @MaxLength(120, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  name!: string;

  @ApiProperty({ example: 'ada@example.com', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254, { message: 'E-mail inválido.' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole, { message: 'Papel deve ser ADMIN ou USER.' })
  role!: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ada Lovelace', minLength: 2, maxLength: 120 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Nome deve ser um texto.' })
  @MinLength(2, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  @MaxLength(120, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  name?: string;

  @ApiPropertyOptional({ example: 'ada@example.com', maxLength: 254 })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'E-mail inválido.' })
  @MaxLength(254, { message: 'E-mail inválido.' })
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel deve ser ADMIN ou USER.' })
  role?: UserRole;
}

export class UpdateSelfUserDto {
  @ApiProperty({ example: 'Ada Lovelace', minLength: 2, maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Nome deve ser um texto.' })
  @MinLength(2, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  @MaxLength(120, { message: 'Nome deve possuir entre 2 e 120 caracteres.' })
  name!: string;
}

export class SetUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean({ message: 'isActive deve ser booleano.' })
  isActive!: boolean;
}

export class ManagedUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  name!: string;

  @ApiProperty({ example: 'ada@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-31T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-31T20:00:00.000Z' })
  updatedAt!: string;
}

export class PaginatedUsersResponseDto extends PaginatedResponseDto<ManagedUserDto> {
  @ApiProperty({ type: () => [ManagedUserDto] })
  declare data: ManagedUserDto[];
}
