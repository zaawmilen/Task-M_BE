// tests/auth/login.test.ts
import request from 'supertest';
import app from '../../app';

describe('Auth API - Login', () => {
  it('should return 400 if credentials are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});
