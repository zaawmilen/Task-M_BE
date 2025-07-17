import { Request, Response } from 'express';
import TaskModel from '../models/task';
import mongoose from 'mongoose';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, dueDate, description } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }
   
    // Validate due date is in the future
    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({ error: 'Due date must be in the future' });
    }
    
    // Get user ID properly - handle both user.id and user.userId for backward compatibility
    const userId = req.user?.id || req.user?.userId;
    
    // Create task with user association
    const task = await TaskModel.create({
      title,
      description,
      dueDate,
      user: userId,
      completed: false // Default value
    });
    
    res.status(201).json({
      _id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      completed: task.completed,
      createdAt: task.createdAt,
      user: userId // Include the user ID in the response
    });
  } catch (error) {
    console.error('Create task error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    // Parse pagination params with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Optional: search by title
    const search = req.query.search as string;
    const query: any = { user: userId };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Get total count for pagination
    const totalTasks = await TaskModel.countDocuments(query);

    // Fetch paginated tasks
    const tasks = await TaskModel.find(query)
      .sort({ dueDate: 1 }) // Optional: sort by due date
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      tasks,
      totalTasks,
      totalPages,
      page
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Add this to getTaskById controller (if not exists):
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;
    
    const task = await TaskModel.findOne({ _id: id, user: userId }).select('-__v');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    // Prevent changing the user or creation date
    if (req.body.user || req.body.createdAt) {
      return res.status(400).json({ error: 'Cannot modify user or creation date' });
    }

    // Validate due date if provided
    if (req.body.dueDate && new Date(req.body.dueDate) < new Date()) {
      return res.status(400).json({ error: 'Due date must be in the future' });
    }
    
    // Get user ID properly - handle both user.id and user.userId for backward compatibility
    const userId = req.user?.id || req.user?.userId;
    
    // Update the task with ownership check
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    // Get user ID properly - handle both user.id and user.userId for backward compatibility
    const userId = req.user?.id || req.user?.userId;
    
    // Delete with ownership check in single operation
    const deletedTask = await TaskModel.findOneAndDelete({ 
      _id: id, 
      user: userId 
    });
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(200).json({ 
      message: 'Task deleted successfully',
      taskId: deletedTask._id 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};