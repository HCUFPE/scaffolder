import { BadRequestException, ForbiddenException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemDetailsFilter } from './problem-details.filter';

describe('ProblemDetailsFilter', () => {
  const filter = new ProblemDetailsFilter();

  function createMockHost(url = '/api/v1/users', headers: Record<string, string> = {}) {
    const jsonMock = vi.fn();
    const headerMock = vi.fn().mockReturnThis();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock, header: headerMock });

    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ url, headers, method: 'POST' }),
        getResponse: () => ({ status: statusMock, header: headerMock, json: jsonMock }),
      }),
    } as unknown as ArgumentsHost;

    return { host, statusMock, jsonMock, headerMock };
  }

  it('formats standard HttpException into Problem Details format', () => {
    const { host, statusMock, jsonMock, headerMock } = createMockHost();
    const exception = new ForbiddenException('Acesso negado.');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(headerMock).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://appstart.example/problems/forbidden',
        title: 'Acesso negado',
        status: 403,
        detail: 'Acesso negado.',
        instance: '/api/v1/users',
        code: 'FORBIDDEN',
        timestamp: expect.any(String),
      }),
    );
  });

  it('formats validation errors into structured errors map', () => {
    const { host, statusMock, jsonMock } = createMockHost();
    const exception = new BadRequestException({
      message: ['email Informe um e-mail válido.', 'name Nome deve possuir entre 2 e 120 caracteres.'],
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://appstart.example/problems/validation-error',
        title: 'Dados inválidos',
        status: 400,
        code: 'VALIDATION_ERROR',
        errors: {
          email: ['Informe um e-mail válido.'],
          name: ['Nome deve possuir entre 2 e 120 caracteres.'],
        },
      }),
    );
  });

  it('includes requestId when present in headers', () => {
    const { host, jsonMock } = createMockHost('/api/v1/users', { 'x-request-id': 'req-12345' });
    const exception = new BadRequestException('Erro de validação');

    filter.catch(exception, host);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-12345',
      }),
    );
  });
});
