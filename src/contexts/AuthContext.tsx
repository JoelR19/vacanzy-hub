import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "@/lib/api";

export type UserRole = "ADMIN" | "GESTOR" | "CODER";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      // Normalizar distintos shapes de respuesta del backend
      const normalized =
        response &&
        (response.data ?? response) &&
        (response.data?.data ?? response.data ?? response);
      const result = (normalized as User) || null;
      setUser(result);
      return result;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getProfile();
        const normalized =
          response &&
          (response.data ?? response) &&
          (response.data?.data ?? response.data ?? response);
        setUser((normalized as User) || null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login(email, password);
    // Después del login el servidor establece la cookie; refrescamos el perfil
    const user = await refreshUser();
    return user;
  };

  const register = async (email: string, password: string, name: string) => {
    await authApi.register(email, password, name);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API call fails
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
