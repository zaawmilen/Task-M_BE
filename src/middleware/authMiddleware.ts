// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { AuthUser } from '../types'; // Import the AuthUser type
import mongoose from 'mongoose';

interface DecodedToken {
  id?: string;
  userId: string;
  role?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  // Check if auth header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      // Find user by id from token
      console.log('Looking for user ID:', decoded.userId);
      const userId = decoded.userId || decoded.id;
     if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
      }

    console.log('Looking for user ID:', userId);
    const userDoc = await User.findById(userId);
      
      if (!userDoc) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Convert Mongoose document to AuthUser format
      const user: AuthUser = {
        id: userDoc._id.toString(), // Convert ObjectId to string
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role || 'user', 
        
      };
      
      // Set req.user to the properly typed user object
      req.user = user;
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      console.log('Token that failed:', token);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'No token provided' });
  }
};

// Also export with the other names to maintain compatibility with other files
export const protect = authMiddleware;

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  console.log('🧪 req.user in adminOnly:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }
};