// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../services/authApi';

// Auth context type definition
type AuthContextType = {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  clearError: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = () => {
      // Auto-login with the demo user for testing purposes
      const demoMode = true; // Set to false to disable auto-login
      
      if (demoMode) {
        console.log("Auto-login with demo user for testing");
        // Simulate a logged-in demo user
        const demoUser = {
          id: "user1",
          name: "Demo User",
          email: "demo@example.com"
        };
        
        setUser(demoUser);
        setIsAuthenticated(true);
        localStorage.setItem('task-manager-current-user', JSON.stringify(demoUser));
        localStorage.setItem('task-manager-auth-token', 'demo-token');
      } else {
        // Normal authentication check
        const currentUser = authApi.getCurrentUser();
        const isLoggedIn = authApi.isLoggedIn();
        
        setUser(currentUser);
        setIsAuthenticated(isLoggedIn);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, automatically succeed with demo user
      if (email === "demo@example.com" && password === "password") {
        const demoUser = {
          id: "user1",
          name: "Demo User",
          email: "demo@example.com"
        };
        
        setUser(demoUser);
        setIsAuthenticated(true);
        
        // Store user data in localStorage
        localStorage.setItem('task-manager-current-user', JSON.stringify(demoUser));
        localStorage.setItem('task-manager-auth-token', 'demo-token');
      } else {
        // Regular login flow
        const { user } = await authApi.login(email, password);
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user } = await authApi.register(name, email, password);
      setUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;