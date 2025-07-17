import { Request, Response } from 'express';
import User, { IUser } from '../models/user'; // Import the IUser interface
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Task from '../models/task'; // adjust the path as needed

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role:  'user' // Default role
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: savedUser._id,
        userId: savedUser._id, // For backward compatibility
        role: savedUser.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Return user info and token (exclude password)
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    };

    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id, // For backward compatibility
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Return user info and token (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user (protected route)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // The auth middleware should have attached the user ID to req.user
    if (!req.user?.id) {
      console.log('No user ID found in request:', req.user);
      return res.status(401).json({ message: 'User ID is required' });
    }
    const tasks = await Task.find({ user: req.user.id });
    // Use either id or userId, whichever is available
    const userId = req.user.id || req.user.userId;
    
    // Log for debugging
    console.log('Looking up user with ID:', userId);

    // Find user by ID and exclude password
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('No user found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.status(200).json({user});
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add this to your authController.js/ts file
// Fix the logout function in authController.ts
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // If using JWT with HTTP-only cookies, clear the cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
