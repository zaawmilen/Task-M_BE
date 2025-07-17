// routes/taskRoutes.ts
import express, { Router, RequestHandler } from 'express';
import { getTasks, createTask, updateTask, deleteTask ,getTaskById } from '../controllers/taskController';
import {authMiddleware} from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware as RequestHandler);

// Cast each controller function to RequestHandler
router.get('/', getTasks as RequestHandler);
router.get('/:id', getTaskById as RequestHandler);
router.post('/', createTask as RequestHandler);
router.put('/:id', updateTask as RequestHandler);
router.delete('/:id', deleteTask as RequestHandler);

export default router;