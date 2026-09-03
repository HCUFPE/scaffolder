import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ErrorMonitoringService } from './error-monitoring.service';
import { redactSensitiveData } from './redaction';
import { RequestIdMiddleware } from './request-id.middleware';

describe('Observability & Sanitization', () => {
  describe('RequestIdMiddleware', () => {
    const middleware = new RequestIdMiddleware();

    it('generates a new UUID requestId when no x-request-id header is provided', () => {
      const req = { headers: {} } as Request;
      const setHeader = vi.fn();
      const res = { setHeader } as unknown as Response;
      const next = vi.fn();

      middleware.use(req, res, next);

      expect(req.requestId).toBeDefined();
      expect(typeof req.requestId).toBe('string');
      expect(req.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(setHeader).toHaveBeenCalledWith('x-request-id', req.requestId);
      expect(next).toHaveBeenCalled();
    });

    it('preserves existing x-request-id header when provided', () => {
      const req = { headers: { 'x-request-id': 'custom-trace-id-123' } } as Request;
      const setHeader = vi.fn();
      const res = { setHeader } as unknown as Response;
      const next = vi.fn();

      middleware.use(req, res, next);

      expect(req.requestId).toBe('custom-trace-id-123');
      expect(setHeader).toHaveBeenCalledWith('x-request-id', 'custom-trace-id-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('redactSensitiveData', () => {
    it('redacts sensitive fields like passwords, cookies, tokens, and hashes', () => {
      const payload = {
        name: 'John Doe',
        password: 'super-secret-password',
        token: 'bearer-jwt-token',
        cookie: 'session_id=123',
        authorization: 'Basic dXNlcjpwYXNz',
        tokenHash: 'sha256hashvalue',
        clientSecret: 'secret-val',
        user: {
          keycloakUserId: 'kc-123',
          email: 'john@example.com',
          nestedSecret: 'hidden',
        },
        items: [
          { token: 'item-token', id: 1 },
          { id: 2 },
        ],
      };

      const redacted = redactSensitiveData(payload);

      expect(redacted).toEqual({
        name: 'John Doe',
        password: '[REDACTED]',
        token: '[REDACTED]',
        cookie: '[REDACTED]',
        authorization: '[REDACTED]',
        tokenHash: '[REDACTED]',
        clientSecret: '[REDACTED]',
        user: {
          keycloakUserId: '[REDACTED]',
          email: 'john@example.com',
          nestedSecret: '[REDACTED]',
        },
        items: [
          { token: '[REDACTED]', id: 1 },
          { id: 2 },
        ],
      });
    });
  });

  describe('ErrorMonitoringService', () => {
    it('instantiates cleanly and captures exceptions safely', () => {
      const service = new ErrorMonitoringService();
      expect(() => service.captureException(new Error('Test error'), { requestId: 'req-1' })).not.toThrow();
    });
  });
});
