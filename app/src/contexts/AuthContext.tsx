import React, { createContext, useContext, useEffect, useState } from "react";
import { checkAuthStatus, login, logout, signup } from "../services/authService";

type AuthContextType = {
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  authenticate: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<{success: boolean, askBiometric?: boolean}>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus.isAuthenticated);
        setEmail(authStatus.email);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const authenticate = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const success = await login(email, password);
      if (success) {
        setIsAuthenticated(true);
        setEmail(email);
      }
      return success;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{success: boolean, askBiometric?: boolean}> => {
    try {
      const result = await signup(email, password);
      if (result.success) {
        setIsAuthenticated(true);
        setEmail(email);
      }
      return {
        success: result.success,
        askBiometric: result.askBiometric
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {success: false};
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await logout();
      setIsAuthenticated(false);
      setEmail(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        email,
        isLoading,
        authenticate,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
