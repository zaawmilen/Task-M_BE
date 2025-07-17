import mongoose, { Schema, Document } from 'mongoose';

export interface Task extends Document {
  
  title: string;
  description: string;
  completed: boolean;
  dueDate: Date | null;
  calendarEventId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId;
}

const taskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: {
      type: String,
      required: false,
      trim: true
    },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date,  required: true }, 
    calendarEventId: { type: String, default: null },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model<Task>('Task', taskSchema);
export default TaskModel;
