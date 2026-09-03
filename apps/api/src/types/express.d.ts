import type { ResolvedSession } from '../auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      auth?: ResolvedSession;
    }
  }
}

export {};
