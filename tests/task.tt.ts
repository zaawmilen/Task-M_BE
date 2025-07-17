import request from 'supertest'; 
import app from '../app';
import User from '../src/models/user';
import Task from '../src/models/task';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { adminToken } from './setup';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const token = adminToken;

describe('Task API Tests', () => {
  let token: string;
  let userId: string;  // <-- change type to string

  beforeAll(async () => {
    // Clear collections before starting
    await Task.deleteMany({});
    await User.deleteMany({});

    // Create user
    const user = await User.create({
      name: 'testuser',
      email: `testuser+${Date.now()}@example.com`,
      password: 'password123',
      role: 'user',
    });

    userId = user._id.toString();  // <-- convert ObjectId to string
    console.log('User created:', user);

    // Generate token using string userId works fine
    token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT token:', token);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: userId,
          title: 'Test Task',
          description: 'Task for testing',
           dueDate: "2025-06-01T00:00:00.000Z", 
        });

      console.log('Response:', res.body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Task');
      expect(res.body.user).toBe(userId); // Exact match with authenticated user

 
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task completion status', async () => {
      const task = await Task.create({
        title: 'Update Test',
        user: userId,  // pass userId as string (Mongoose accepts string)
        completed: false,
         dueDate: "2025-06-01T00:00:00.000Z", 
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Delete Test',
        user: userId,  // string id here as well
        dueDate: "2025-06-01T00:00:00.000Z", 
        
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
