// tests/adminRoutes.test.ts
import request from 'supertest';
import app from '../app';
import { adminToken, adminUserId } from './setup';
import User from '../src/models/user';

describe('🔐 Admin Routes', () => {
  let createdUserId: string;

   // Add more debugging for setup
  beforeAll(async () => {
    // Clear only non-admin users before these tests
    await User.deleteMany({ _id: { $ne: adminUserId } });
    console.log('🔧 Admin Routes tests starting...');
    console.log('🔑 Admin token available:', !!adminToken);
    console.log('🔑 Admin token length:', adminToken.length);
  });

  it('GET /api/admin/users → should return all users', async () => {
      console.log('🔍 Testing GET /api/admin/users');
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
      
     console.log('📊 Response status:', res.statusCode);
     console.log('📊 Response body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

   it('POST /api/admin/users → should create a new user', async () => {
    console.log('🔍 Testing POST /api/admin/users');
    const userData = {
      name: 'Test User',
      email: `testuser+${Date.now()}@example.com`,
      password: 'test123',
      role: 'user',
    };
    
    console.log('📝 Creating user with data:', userData);
    
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userData);

    console.log('📊 Response status:', res.statusCode);
    console.log('📊 Response body:', res.body);

     if (res.statusCode !== 201) {
      console.error('Unexpected response:', res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    createdUserId = res.body._id;
  });

  it('PUT /api/admin/users/:id/promote → should promote the user', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}/promote`)
      .set('Authorization', `Bearer ${adminToken}`);

     console.log('📊 Response status:', res.statusCode);
     console.log('📊 Response body:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });

  it('PUT /api/admin/users/:id/demote → should demote the user', async () => {
   console.log(`🔍 Testing PUT /api/admin/users/${createdUserId}/demote`);
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}/demote`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('📊 Response status:', res.statusCode);
    console.log('📊 Response body:', res.body);
    // Check if the user is demoted back to 'user'
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('user');
  });

  it('PUT /api/admin/users/:id → should update the user info', async () => {
    console.log(`🔍 Testing PUT /api/admin/users/${createdUserId}/demote`);
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Test User' });

    console.log('📊 Response status:', res.statusCode);
    console.log('📊 Response body:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Updated Test User');
  });

  it('DELETE /api/admin/users/:id → should delete the user', async () => {
    console.log(`🔍 Testing DELETE /api/admin/users/${createdUserId}`);
    const res = await request(app)
      .delete(`/api/admin/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('📊 Response status:', res.statusCode);
    console.log('📊 Response body:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
