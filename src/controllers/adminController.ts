import { Request, Response } from 'express';
import UserModel from '../models/user';
import TaskModel from '../models/task';
import { RequestHandler } from 'express';

export const createUser: RequestHandler = async (req, res) => {
  console.log("createUser route hit");
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const newUser = await UserModel.create({ name, email, password, role: role || 'user' });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
};

// New function to get all tasks for all users
export const getAllUserTasks = async (req: Request, res: Response) => {
  try {
    console.log('getAllUserTasks called');
    
    // Find all tasks and populate with user information (excluding password)
    const tasks = await TaskModel.find()
      .populate({
        path: 'user',
        select: 'name email username role'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${tasks.length} tasks`);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error in getAllUserTasks:', err);
    res.status(500).json({ 
      message: 'Error fetching tasks', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
};

// Get tasks for a specific user
export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(`getUserTasks called for user: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user exists
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find all tasks for the specified user
    const tasks = await TaskModel.find({ user: userId }).sort({ createdAt: -1 });
    console.log(`Found ${tasks.length} tasks for user ${userId}`);
    
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error in getUserTasks:', err);
    res.status(500).json({ 
      message: 'Error fetching user tasks', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
};

export const promoteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Promote route hit'); 
    const userId = req.params.id;
    
    // Check if the user ID exists in params
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    // Use findByIdAndUpdate instead of save() to avoid validation issues
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {  $set:{role: 'admin'} },
      { new: true, runValidators: false }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ 
      message: 'User promoted to admin successfully', 
      user: updatedUser
    });
  } catch (err) {
    console.error('Error in promoteUser:', err);
    res.status(500).json({ message: 'Server error while promoting user', error: err instanceof Error ? err.message : String(err) });
  }
};

export const demoteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Demote route hit'); // Added logging like in promoteUser
    const userId = req.params.id;
    
    // Check if the user ID exists in params
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // Prevent self-demotion
    if (req.user && req.user.id === userId) {  
      res.status(400).json({ message: "You cannot demote yourself." });
      return;
    }
    
    // Use findByIdAndUpdate with $set operator like in promoteUser
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { role: 'user' } }, // Added $set operator
      { new: true, runValidators: false }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ 
      message: 'User demoted to regular user successfully', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error in demoteUser:', err);
    res.status(500).json({ 
      message: 'Server error while demoting user', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Delete user route hit'); // Added logging
    const userId = req.params.id;
    
    // Check if the user ID exists in params
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // Prevent self-deletion
    if (req.user && req.user.id === userId) {  
      res.status(400).json({ message: "You cannot delete your own account." });
      return;
    }

    // Using findByIdAndDelete (consistent with your existing approach)
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ 
      message: 'User deleted successfully',
      userId: deletedUser._id // Optionally include the deleted user's ID
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ 
      message: 'Server error while deleting user', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
};
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Update user route hit');
    const userId = req.params.id;

    const { name, email, role } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({
      message: 'Server error while updating user',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
