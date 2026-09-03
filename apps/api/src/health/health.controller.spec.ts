import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns live status without external dependencies', () => {
    const prisma = {} as unknown as PrismaService;
    const controller = new HealthController(prisma);

    expect(controller.live()).toEqual({ status: 'live' });
  });

  it('returns ready status when database query succeeds', async () => {
    const prisma = {
      $queryRawUnsafe: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);
    const result = await controller.ready();

    expect(result).toEqual({
      status: 'ready',
      checks: {
        database: 'up',
      },
    });
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith('SELECT 1');
  });

  it('throws ServiceUnavailableException when database query fails', async () => {
    const prisma = {
      $queryRawUnsafe: vi.fn().mockRejectedValue(new Error('Connection refused')),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    await expect(controller.ready()).rejects.toThrow(ServiceUnavailableException);
  });
});
