import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../app';
import TaskModel from '../src/models/task';
import { userToken, regularUserId } from './setup';

dotenv.config();

describe('Task API Tests', () => {
  let taskId: string;

  afterEach(async () => {
    await TaskModel.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Task',
          dueDate: new Date().toISOString(),
          description: 'Test description',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Task');
      expect(res.body.user).toBe(regularUserId);
      expect(res.body.completed).toBe(false);

      taskId = res.body._id;
    });

    it('should reject task with past due date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Task',
          dueDate: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Due date must be in the future');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await TaskModel.create([
        { title: 'Task 1', user: regularUserId, dueDate: new Date() },
        { title: 'Task 2', user: regularUserId, dueDate: new Date(), completed: true },
      ]);
    });

    it('should get all tasks for the user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(2);
    });

    it('should filter by completed status', async () => {
      const res = await request(app)
        .get('/api/tasks?completed=true')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].completed).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      const task = await TaskModel.create({
        title: 'To Update',
        user: regularUserId,
        dueDate: new Date().toISOString(),
      });
      taskId = (task as any)._id.toString(); // Temporary type assertion
    });

    it('should update a task completion status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });

    it('should reject update with invalid task ID', async () => {
      const res = await request(app)
        .put('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ completed: true });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid task ID');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      const task = await TaskModel.create({
        title: 'To Delete',
        user: regularUserId,
        dueDate: new Date().toISOString(),
      });
      taskId = (task as any)._id.toString(); // Temporary type assertion
    });

    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      const deletedTask = await TaskModel.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 when deleting non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});