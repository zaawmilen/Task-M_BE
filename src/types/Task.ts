// types/Task.ts
export interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'active' | 'completed';
    user: {
      _id: string;
      name: string;
      email: string;
      username: string;
      role: string;
    } | string;
    
    dueDate: string | null; // ISO string format for dates
    calendarEventId: string | null;
    createdAt: string;
    updatedAt: string;
  }