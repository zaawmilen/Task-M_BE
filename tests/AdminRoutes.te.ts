import request from 'supertest';
import app from '../app'; // Adjust path to your Express app
import { adminToken } from './setup';
import User from '../src/models/user'; // Adjust path if needed

describe('AdminRoutes', () => {
  describe('GET /api/admin/users', () => {
    it('should return all users for an admin', async () => {
      // Add debugging to see the token value
      console.log('Admin token being used:', adminToken);
      
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Debug the response
      console.log('Response status:', res.status);
      console.log('Response body:', res.body);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });
describe('POST /api/admin/users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)// 🔑 Add token here too!
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword',
        role: 'user'
      });
      

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('John Doe');
  });
}); 


  describe('PUT /api/admin/users/:id', () => {
    it('should update an existing user', async () => {
      // First create a user to update
      const user = await User.create({
        name: 'updateTest',
        email: 'update@example.com',
        password: 'password123',
        role: 'user'
      });

     const res = await request(app)
  .put(`/api/admin/users/${user._id}`)
  .set('Authorization', `Bearer ${adminToken}`)
  .send({ name: 'updatedName' });  // likely schema requires 'name'
    //  console.log('Response:', res.body);
// console.log('Status:', res.status);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('updatedName');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete a user', async () => {
      // First create a user to delete
      const user = await User.create({
        name: 'deleteTest',
        email: 'delete@example.com',
        password: 'password123',
        role: 'user'
      });

      const res = await request(app)
        .delete(`/api/admin/users/${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });
});