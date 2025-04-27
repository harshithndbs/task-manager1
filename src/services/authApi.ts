// src/services/authApi.ts
export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // In a real app, never store plain passwords
  }
  
  // Storage keys
  const USERS_STORAGE_KEY = 'task-manager-users';
  const CURRENT_USER_KEY = 'task-manager-current-user';
  const AUTH_TOKEN_KEY = 'task-manager-auth-token';
  
  // Helper to simulate network delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  class AuthApiService {
    // Initialize with a default user if none exists
    constructor() {
      const users = this.getUsers();
      if (users.length === 0) {
        const defaultUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'password123'
        };
        
        this.saveUsers([defaultUser]);
      }
    }
  
    // Get users from localStorage
    private getUsers(): User[] {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    }
  
    // Save users to localStorage
    private saveUsers(users: User[]): void {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  
    // Register a new user
    async register(name: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string }> {
      await delay(800);
      
      try {
        const users = this.getUsers();
        
        // Check if email already exists
        if (users.some(user => user.email === email)) {
          throw new Error('Email already registered');
        }
        
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password // In a real app, this would be hashed
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        // Generate token (simulated)
        const token = `token-${newUser.id}-${Date.now()}`;
        
        // Store current user and token
        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        
        return { user: userWithoutPassword, token };
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    }
  
    // Login an existing user
    async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string }> {
      await delay(800);
      
      try {
        const users = this.getUsers();
        
        // Find user with matching email and password
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        // Generate token (simulated)
        const token = `token-${user.id}-${Date.now()}`;
        
        // Store current user and token
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        
        return { user: userWithoutPassword, token };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
  
    // Check if user is logged in
    isLoggedIn(): boolean {
      return !!localStorage.getItem(AUTH_TOKEN_KEY);
    }
  
    // Get current user
    getCurrentUser(): Omit<User, 'password'> | null {
      const userJson = localStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
  
    // Logout user
    async logout(): Promise<void> {
      await delay(300);
      
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  
    // Update user profile
    async updateProfile(userId: string, data: { name?: string, email?: string }): Promise<Omit<User, 'password'>> {
      await delay(500);
      
      try {
        const users = this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        // Update user
        users[userIndex] = {
          ...users[userIndex],
          ...data
        };
        
        this.saveUsers(users);
        
        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          const { password: _, ...updatedUser } = users[userIndex];
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
          return updatedUser;
        }
        
        const { password: _, ...userWithoutPassword } = users[userIndex];
        return userWithoutPassword;
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    }
  }
  
  // Export a singleton instance
  export default new AuthApiService();