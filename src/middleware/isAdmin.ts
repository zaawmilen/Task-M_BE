// src/middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('🧪 isAdmin middleware called with req.user:', req.user);
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }
};

export default isAdmin;