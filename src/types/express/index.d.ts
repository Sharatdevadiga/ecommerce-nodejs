import type { UserRole } from '../../database/models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}

