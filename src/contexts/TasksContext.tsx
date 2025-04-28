// src/contexts/TasksContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import taskApi from '../services/taskApi';
import { Task } from '../data/mockTasks';
import { useAuth } from './AuthContext';

// Tasks context type definition
type TasksContextType = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: { category?: string; completed?: boolean }) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  stats: {
    total: number;
    completed: number;
    pending: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  } | null;
  refreshStats: () => Promise<void>;
};

// Create context with default values
const TasksContext = createContext<TasksContextType>({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {},
  createTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  getTaskById: () => undefined,
  stats: null,
  refreshStats: async () => {},
});

// Custom hook to use tasks context
export const useTasks = () => useContext(TasksContext);

// Tasks provider component
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TasksContextType['stats']>(null);
  
  const { user, isAuthenticated } = useAuth();

  // Fetch all tasks for the current user
  const fetchTasks = async (filters?: { category?: string; completed?: boolean }) => {
    if (!isAuthenticated) {
      console.log("Not authenticated, clearing tasks");
      setTasks([]);
      return;
    }
    
    if (!user) {
      console.log("No user found, clearing tasks");
      setTasks([]);
      return;
    }
    
    console.log("Fetching tasks for user:", user.id);
    setLoading(true);
    setError(null);
    
    try {
      const fetchedTasks = await taskApi.getTasks(user.id, filters);
      console.log(`Fetched ${fetchedTasks.length} tasks for user ${user.id}`);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  // Refresh task statistics
  const refreshStats = async () => {
    if (!isAuthenticated || !user) {
      setStats(null);
      return;
    }
    
    try {
      const taskStats = await taskApi.getTaskStats(user.id);
      setStats(taskStats);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch tasks when auth state changes
  useEffect(() => {
    console.log("Auth state changed - isAuthenticated:", isAuthenticated, "user:", user);
    if (isAuthenticated && user) {
      fetchTasks();
      refreshStats();
    } else {
      setTasks([]);
      setStats(null);
    }
  }, [isAuthenticated, user]);

  // Create a new task
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newTask = await taskApi.createTask({
        ...taskData,
        userId: user.id,
      });
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTask = await taskApi.updateTask(id, taskData);
      
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error updating task');
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await taskApi.deleteTask(id);
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      await refreshStats();
    } catch (err: any) {
      setError(err.message || 'Error deleting task');
    } finally {
      setLoading(false);
    }
  };

  // Get a task by ID
  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
        stats,
        refreshStats,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export default TasksContext;