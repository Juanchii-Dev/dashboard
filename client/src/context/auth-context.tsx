import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Tipo para el usuario autenticado
type User = {
  id: number;
  email: string;
  username: string;
  name: string | null;
  email_verified: boolean;
};

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Cargar datos de autenticación del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Si hay un error al parsear el usuario, limpiar todo
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    
    // Guardar en localStorage
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Hacer la petición al backend para cerrar sesión
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // Limpiar el estado y localStorage
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      
      // Mostrar toast y redirigir
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente."
      });
      
      navigate("/login");
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// Componente de protección de rutas
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}