// tests/auth/register.test.ts
import request from 'supertest';
import app from '../../app';
import { createFakeUser } from '../factories/userFactory';

jest.setTimeout(15000); 

describe('Auth API - Register', () => {
  it('should register a new user successfully', async () => {
    const newUser = createFakeUser();

    const res = await request(app).post('/api/auth/register').send(newUser);

    console.log('Register response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email.toLowerCase()).toBe(newUser.email.toLowerCase());

  });
});
