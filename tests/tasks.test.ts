// tests/tasks.test.ts
import request from 'supertest';
import app from '../app';
import Task from '../src/models/task';
import { userToken, regularUserId } from './setup';

let createdTaskId: string;

describe('App Root Route', () => {
  it('should return Task Manager API', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Task Manager API');
  });
});

describe('Task Routes', () => {
    // Create a future date (tomorrow) that will pass validation
  const getFutureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  };

  afterAll(async () => {
    await Task.deleteMany({ user: regularUserId });
  });
   
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Task',
        description: 'Unit test for POST /tasks',
        dueDate: getFutureDate().toISOString(),
      });
    console.log('Create Task Response:', res.body);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    createdTaskId = res.body._id;
  });

  it('should get all tasks for authenticated user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`);
    console.log('Get All Tasks Response:', res.body);
    
    expect(res.statusCode).toBe(200);
    // expect(res.body).toHaveProperty('tasks');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a specific task by ID', async () => {
    // First verify the task exists
  const task = await Task.findById(createdTaskId);
  if (!task) {
    throw new Error(`Test task ${createdTaskId} not found in database`);
  }
    
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
      console.log('Get Task Response:', res.body); 
  
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(createdTaskId);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        completed: true,
        dueDate: getFutureDate().toISOString(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.completed).toBe(true);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

it('should reject tasks with past due dates', async () => {
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1); // 1 year ago
  
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Invalid Past Date Task',
      description: 'This should fail validation',
      dueDate: pastDate.toISOString()
    });

  console.log('Past Date Task Response:', res.body); // For debugging
  
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('error');
  expect(res.body.error).toMatch(/must be in the future/i);
});


});
