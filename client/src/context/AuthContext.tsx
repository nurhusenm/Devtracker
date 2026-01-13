import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';

// Define the shape of our Context
interface AuthContextType {
  user: string | null; // We'll just store the user ID or Token for now
  login: (token: string, userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the Context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  // Check if token exists when the app starts (Persistence)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    // If we have a token in storage, we are "logged in"
    const token = localStorage.getItem('token');
    if (token) {
        setIsAuthenticated(true);
        // Ideally, you would decode the token here to get the User ID
    }
  }, []);

  const login = (token: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    setUser(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use the Context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
