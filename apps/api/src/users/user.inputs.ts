import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
}

export type UpdateUserInput = Partial<CreateUserInput>;

function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Payload de usuário inválido.');
  }
  return input as Record<string, unknown>;
}

function exactFields(record: Record<string, unknown>, allowed: string[]): void {
  if (Object.keys(record).some((key) => !allowed.includes(key))) {
    throw new BadRequestException('O payload contém campos não permitidos.');
  }
}

function name(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 120) {
    throw new BadRequestException('Nome deve possuir entre 2 e 120 caracteres.');
  }
  return value.trim();
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') throw new BadRequestException('E-mail inválido.');
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new BadRequestException('E-mail inválido.');
  }
  return normalized;
}

function role(value: unknown): UserRole {
  if (value !== UserRole.ADMIN && value !== UserRole.USER) {
    throw new BadRequestException('Papel deve ser ADMIN ou USER.');
  }
  return value;
}

export function parseCreateUserInput(input: unknown): CreateUserInput {
  const record = object(input);
  exactFields(record, ['name', 'email', 'role']);
  return { name: name(record.name), email: normalizeEmail(record.email), role: role(record.role) };
}

export function parseUpdateUserInput(input: unknown): UpdateUserInput {
  const record = object(input);
  exactFields(record, ['name', 'email', 'role']);
  if (Object.keys(record).length === 0) throw new BadRequestException('Informe ao menos um campo para atualização.');
  return {
    ...(record.name !== undefined ? { name: name(record.name) } : {}),
    ...(record.email !== undefined ? { email: normalizeEmail(record.email) } : {}),
    ...(record.role !== undefined ? { role: role(record.role) } : {}),
  };
}

export function parseStatusInput(input: unknown): { isActive: boolean } {
  const record = object(input);
  exactFields(record, ['isActive']);
  if (typeof record.isActive !== 'boolean') throw new BadRequestException('isActive deve ser booleano.');
  return { isActive: record.isActive };
}

export function parsePagination(input: {
  page?: string;
  pageSize?: string;
  search?: string;
}): { page: number; pageSize: number; search?: string } {
  const page = Number(input.page ?? '1');
  const pageSize = Number(input.pageSize ?? '20');
  if (!Number.isInteger(page) || page < 1) throw new BadRequestException('page deve ser um inteiro maior que zero.');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new BadRequestException('pageSize deve ser um inteiro entre 1 e 100.');
  }
  const search = input.search?.trim();
  if (search && search.length > 120) throw new BadRequestException('search deve possuir no máximo 120 caracteres.');
  return { page, pageSize, ...(search ? { search } : {}) };
}
