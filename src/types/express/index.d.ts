import { Request } from 'express';
import { AuthUser } from '../../types';


// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

