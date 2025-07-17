// index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// Route files
import adminRoutes from './routes/AdminRoutes';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// API Routes
app.use('/api/admin', adminRoutes);     // Admin routes (protected internally)
app.use('/api/auth', authRoutes);       // Public + protected auth routes
app.use('/api/tasks', taskRoutes);      // Task CRUD (requires login)

// Root test route
app.get('/', (req, res) => {
  res.send('Server running...');
});

// MongoDB connection + server start
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
  });
