// src/services/taskApi.ts
import { Task } from '../data/mockTasks';

// Storage key
const TASKS_STORAGE_KEY = 'tasks-data';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Define mock data directly in the file instead of importing
const mockTasksData: Task[] = [
  {
    id: "task-001",
    title: "Complete Ionic React project",
    description: "Finish implementing the task manager mobile app for Web and Mobile Technologies class",
    completed: false,
    dueDate: "2025-05-10",
    priority: "high" as 'high',
    category: "School",
    userId: "user1",
    createdAt: "2025-04-01",
    updatedAt: "2025-04-01"
  },
  {
    id: "task-002",
    title: "Study for final exams",
    description: "Review all course materials and prepare for upcoming final exams",
    completed: false,
    dueDate: "2025-05-15",
    priority: "high" as 'high',
    category: "School",
    userId: "user1",
    createdAt: "2025-04-02",
    updatedAt: "2025-04-02"
  },
  {
    id: "task-003",
    title: "Buy groceries",
    description: "Get milk, eggs, bread, vegetables, and fruits from the supermarket",
    completed: true,
    dueDate: "2025-04-05",
    priority: "medium" as 'medium',
    category: "Personal",
    userId: "user1",
    createdAt: "2025-04-02",
    updatedAt: "2025-04-03"
  },
  {
    id: "task-004",
    title: "Schedule dentist appointment",
    description: "Call the dentist to schedule a check-up appointment",
    completed: false,
    dueDate: "2025-04-20",
    priority: "low" as 'low',
    category: "Health",
    userId: "user1",
    createdAt: "2025-04-03",
    updatedAt: "2025-04-03"
  },
  {
    id: "task-005",
    title: "Pay utility bills",
    description: "Pay electricity, water, and internet bills before due date",
    completed: true,
    dueDate: "2025-04-10",
    priority: "medium" as 'medium',
    category: "Finance",
    userId: "user1",
    createdAt: "2025-04-03",
    updatedAt: "2025-04-08"
  },
  {
    id: "task-006",
    title: "Finish book chapter",
    description: "Read chapter 5 of 'Design Patterns in React' book",
    completed: false,
    dueDate: "2025-04-15",
    priority: "low" as 'low',
    category: "Learning",
    userId: "user1",
    createdAt: "2025-04-05",
    updatedAt: "2025-04-05"
  },
  {
    id: "task-007",
    title: "Weekly team meeting",
    description: "Attend the weekly team meeting to discuss project progress",
    completed: false,
    dueDate: "2025-04-12",
    priority: "medium" as 'medium',
    category: "Work",
    userId: "user1",
    createdAt: "2025-04-06",
    updatedAt: "2025-04-06"
  },
  {
    id: "task-008",
    title: "Go for a run",
    description: "30 minutes of jogging in the park",
    completed: true,
    dueDate: "2025-04-07",
    priority: "low" as 'low',
    category: "Health",
    userId: "user1",
    createdAt: "2025-04-06",
    updatedAt: "2025-04-07"
  },
  {
    id: "task-009",
    title: "Prepare presentation",
    description: "Create slides for the project presentation",
    completed: false,
    dueDate: "2025-04-25",
    priority: "high" as 'high',
    category: "School",
    userId: "user1",
    createdAt: "2025-04-07",
    updatedAt: "2025-04-07"
  },
  {
    id: "task-010",
    title: "Fix kitchen sink",
    description: "Call the plumber to fix the leaking kitchen sink",
    completed: false,
    dueDate: "2025-04-18",
    priority: "medium" as 'medium',
    category: "Home",
    userId: "user1",
    createdAt: "2025-04-08",
    updatedAt: "2025-04-08"
  }
];

class TaskApiService {
  // Initialize tasks in localStorage if not present
  constructor() {
    // Force initialize localStorage with mock data
    try {
      // Check if there are valid tasks in localStorage
      const existingTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      const parsedTasks = existingTasks ? JSON.parse(existingTasks) : [];
      
      // If no tasks or invalid data, use mock data
      if (!Array.isArray(parsedTasks) || parsedTasks.length === 0) {
        console.log("Initializing localStorage with mock tasks");
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(mockTasksData));
      } else {
        console.log(`Found ${parsedTasks.length} existing tasks in localStorage`);
      }
    } catch (error) {
      console.error("Error initializing task storage:", error);
      // In case of any error, reset with mock data
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(mockTasksData));
    }
  }

  // Get all tasks with optional filtering
  async getTasks(userId: string, filters?: { category?: string; completed?: boolean }): Promise<Task[]> {
    // Simulate network request
    await delay(500);
    
    try {
      console.log("Getting tasks for user:", userId);
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      
      if (!tasksJson) {
        console.log("No tasks found in storage, re-initializing");
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(mockTasksData));
        return this.filterTasks(mockTasksData, userId, filters);
      }
      
      const tasks: Task[] = JSON.parse(tasksJson);
      console.log(`Retrieved ${tasks.length} tasks from storage`);
      
      return this.filterTasks(tasks, userId, filters);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to mock data in case of error
      return this.filterTasks(mockTasksData, userId, filters);
    }
  }
  
  // Helper to filter tasks
  private filterTasks(tasks: Task[], userId: string, filters?: { category?: string; completed?: boolean }): Task[] {
    // Filter by user ID
    let filteredTasks = tasks.filter(task => task.userId === userId);
    console.log(`Filtered to ${filteredTasks.length} tasks for userId ${userId}`);
    
    // Apply additional filters if provided
    if (filters) {
      if (filters.category) {
        filteredTasks = filteredTasks.filter(task => task.category === filters.category);
      }
      
      if (filters.completed !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.completed === filters.completed);
      }
    }
    
    return filteredTasks;
  }

  // Get a single task by ID
  async getTask(taskId: string): Promise<Task | null> {
    await delay(300);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) {
        return null;
      }
      
      const tasks: Task[] = JSON.parse(tasksJson);
      const task = tasks.find(t => t.id === taskId);
      
      return task || null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw new Error('Failed to fetch task');
    }
  }

  // Create a new task
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await delay(500);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now().toString()}`,
        createdAt: now,
        updatedAt: now
      };
      
      tasks.push(newTask);
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  // Update an existing task
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    await delay(500);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) {
        throw new Error('No tasks found in storage');
      }
      
      const tasks: Task[] = JSON.parse(tasksJson);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      const updatedTask: Task = {
        ...tasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      tasks[taskIndex] = updatedTask;
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<boolean> {
    await delay(500);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) {
        throw new Error('No tasks found in storage');
      }
      
      const tasks: Task[] = JSON.parse(tasksJson);
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      
      if (updatedTasks.length === tasks.length) {
        throw new Error('Task not found');
      }
      
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  // Get task statistics
  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    await delay(300);
    
    try {
      const tasks = await this.getTasks(userId);
      
      const completed = tasks.filter(t => t.completed).length;
      const pending = tasks.length - completed;
      
      // Count by category
      const byCategory: Record<string, number> = {};
      tasks.forEach(task => {
        byCategory[task.category] = (byCategory[task.category] || 0) + 1;
      });
      
      // Count by priority
      const byPriority: Record<string, number> = {};
      tasks.forEach(task => {
        byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      });
      
      return {
        total: tasks.length,
        completed,
        pending,
        byCategory,
        byPriority
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      throw new Error('Failed to get task statistics');
    }
  }
}

// Export a singleton instance
export default new TaskApiService();