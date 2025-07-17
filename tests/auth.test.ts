// tests/auth.test.ts
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../src/models/user';

describe('Auth Routes', () => {
  const testEmail = `testuser+${Date.now()}@example.com`;
  const password = 'test123';

  afterAll(async () => {
    await User.deleteMany({ email: testEmail });
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: testEmail,
      password,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: testEmail,
      password,
    });
   console.log('Login response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });
});
