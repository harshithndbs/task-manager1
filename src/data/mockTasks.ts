export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Ionic project',
    description: 'Finish the mobile app project for Web and Mobile Technologies course',
    completed: false,
    dueDate: '2025-05-15',
    priority: 'high',
    category: 'School',
    userId: 'user1',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-01'
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and vegetables',
    completed: true,
    dueDate: '2025-04-05',
    priority: 'medium',
    category: 'Personal',
    userId: 'user1',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-02'
  },
  {
    id: '3',
    title: 'Schedule dentist appointment',
    description: 'Call the dentist for a check-up',
    completed: false,
    dueDate: '2025-04-20',
    priority: 'low',
    category: 'Health',
    userId: 'user1',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-01'
  }
];

// Initialize localStorage with mock data if empty
if (!localStorage.getItem('tasks-data')) {
  localStorage.setItem('tasks-data', JSON.stringify(initialTasks));
}