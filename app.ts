// app.ts
import express from 'express';
import authRoutes from './src/routes/authRoutes'; // Adjust the path as needed
import taskRoutes from './src/routes/taskRoutes'
import dotenv from 'dotenv';
import adminRoutes from './src/routes/AdminRoutes'; // Adjust the path as needed
import cors from 'cors';
dotenv.config();

const app = express();

// middlewares, routes, etc.
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Task Manager API');
  });
export default app;
