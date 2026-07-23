import type { AuthenticatedUser } from '../domain/access/accessPolicy.js';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthenticatedUser;
      scope?: { projectId: string };
    }
  }
}

export {};
