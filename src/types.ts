// src/types.ts

import { Request } from 'express';

// Define a single consistent user type for all middleware
export interface AuthUser {
  id: string;      // Common user identifier
  userId?: string; // For backward compatibility
  role?: 'user' | 'admin';
  [key: string]: any; // Allow additional properties
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// For backward compatibility if needed
export interface AuthRequest extends Request {
  user?: AuthUser;
}