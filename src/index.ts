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
app.use(cors({
  origin: 'https://z-task-manager.netlify.app',
  credentials: true
}));
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
mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log('📍 Connected to:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection established');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('💥 MongoDB connection failed:', err.message);
    console.error('Full error:', err);
  });