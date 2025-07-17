// tests/cleanup.ts
import mongoose from 'mongoose';
import { adminUserId } from './setup';
import User from '../src/models/user';
import Task from '../src/models/task';

beforeEach(async () => {
  await Task.deleteMany({});
  await User.deleteMany({ _id: { $ne: adminUserId } });
});

afterAll(async () => {
  await mongoose.connection.close();
});