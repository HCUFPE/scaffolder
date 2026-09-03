import { BadRequestException } from '@nestjs/common';

export interface SelfServiceProfileUpdate {
  name: string;
}

const protectedFields = new Set([
  'id',
  'keycloakUserId',
  'role',
  'roleSnapshot',
  'isActive',
  'isActiveLocal',
]);

export function parseSelfServiceProfileUpdate(input: unknown): SelfServiceProfileUpdate {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Payload de perfil inválido.');
  }

  const record = input as Record<string, unknown>;
  const attemptedProtectedFields = Object.keys(record).filter((key) => protectedFields.has(key));
  if (attemptedProtectedFields.length > 0) {
    throw new BadRequestException('O payload contém campos protegidos.');
  }

  const unknownFields = Object.keys(record).filter((key) => key !== 'name');
  if (unknownFields.length > 0) throw new BadRequestException('O payload contém campos não permitidos.');
  if (typeof record.name !== 'string' || record.name.trim().length < 2 || record.name.trim().length > 120) {
    throw new BadRequestException('Nome deve possuir entre 2 e 120 caracteres.');
  }

  return { name: record.name.trim() };
}
