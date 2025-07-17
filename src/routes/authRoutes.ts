import express, { Router, RequestHandler } from 'express';
import { register, login, getCurrentUser,logout  } from '../controllers/authController';
import {authMiddleware} from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/logout', logout as RequestHandler);
// Protected route - get current user
router.get('/me', authMiddleware as RequestHandler, getCurrentUser as RequestHandler);

export default router;