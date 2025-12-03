"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  clientId: string;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUser: User = {
  name: "Mrs. Martin",
  clientId: "78910",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA_XeqSFDM6_sDXQjWs1Xms4SwAJ-LsKlcwXSQ-Hv4Yx62DFIP3mZ-aCOuHgtUmbLzs6dqNrZ76pwBEZiafV1eLsLi9nI5HkRtxmndMWkOLMufCGCVYuZos8QMzEdKeJ-QmQDLJmbTrGEIuGDiQTE20M74DLNW9vs4CpUKSLohSTc5CTQgAAdsp43ceP7AgdIsOJmWNFH3fFAo43XikT6ghS9lV8GgYw5-LCtkUXEpun66PXfEAVOJ979E0qsWv3Etwm0Xoae1e3jM",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("user");

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication - in a real app, this would call an API
    // For demo purposes, accept any email/password
    if (email && password) {
      setIsAuthenticated(true);
      setUser(defaultUser);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(defaultUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

