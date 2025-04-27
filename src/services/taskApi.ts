// src/services/taskApi.ts
import { Task, initialTasks } from '../data/mockTasks';

// Storage key
const TASKS_STORAGE_KEY = 'tasks-data';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class TaskApiService {
  // Initialize tasks in localStorage if not present
  constructor() {
    if (!localStorage.getItem(TASKS_STORAGE_KEY)) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
    }
  }

  // Get all tasks with optional filtering
  async getTasks(userId: string, filters?: { category?: string; completed?: boolean }): Promise<Task[]> {
    // Simulate network request
    await delay(500);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      
      // Filter by user ID
      let filteredTasks = tasks.filter(task => task.userId === userId);
      
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
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  // Get a single task by ID
  async getTask(taskId: string): Promise<Task | null> {
    await delay(300);
    
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
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
        id: Date.now().toString(),
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
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      
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
      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      
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