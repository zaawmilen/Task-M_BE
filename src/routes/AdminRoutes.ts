// routes/adminRoutes.ts
import express, { RequestHandler } from 'express';
import { 
  getAllUsers, 
  promoteUser, 
  demoteUser, 
  deleteUser,
  getAllUserTasks,
  getUserTasks,
  createUser,
  updateUser,
} from '../controllers/adminController';
import isAdmin from '../middleware/isAdmin';
import { protect} from '../middleware/authMiddleware';


const router = express.Router();

// Protect all admin routes
router.use(protect as RequestHandler);
router.use(isAdmin as RequestHandler);

console.log('Registering admin routes...');

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/promote', promoteUser);
router.put('/users/:id/demote', demoteUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Task access routes
router.get('/tasks', getAllUserTasks); // Get all tasks from all users
router.get('/users/:userId/tasks', getUserTasks as RequestHandler);

console.log('Admin routes registered successfully');

export default router;