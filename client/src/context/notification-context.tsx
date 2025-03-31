import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

// Definimos la interfaz para las notificaciones
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  date: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "read" | "date">) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

// Tipos de configuración de notificaciones
export type NotificationPreferences = {
  transactions: boolean;
  budgetExceeded: boolean;
  goalsReached: boolean;
  financialTips: boolean;
  monthlyReports: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Verificar permisos al cargar
  useEffect(() => {
    checkPermission();
    loadNotifications();
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Carga notificaciones de localStorage
  const loadNotifications = () => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      } else {
        // Si no hay notificaciones, agregamos algunas de ejemplo
        setNotifications([
          {
            id: uuidv4(),
            title: "Presupuesto excedido",
            message: "Has excedido tu presupuesto de Transporte en un 6%",
            type: "warning",
            read: false,
            date: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
          },
          {
            id: uuidv4(),
            title: "Próximo pago",
            message: "Recuerda: mañana vence el pago de tu factura telefónica",
            type: "info",
            read: false,
            date: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
          },
          {
            id: uuidv4(),
            title: "Meta financiera",
            message: "¡Felicidades! Estás al 60% de tu meta 'Vacaciones'",
            type: "success",
            read: true,
            date: new Date(Date.now() - 172800000).toISOString() // 2 días atrás
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Verifica si el navegador tiene permiso para mostrar notificaciones
  const checkPermission = () => {
    if (!("Notification" in window)) {
      setHasPermission(false);
      return;
    }

    if (Notification.permission === "granted") {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  };

  // Solicita permiso para mostrar notificaciones
  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast({
        title: "Error",
        description: "Este navegador no soporta notificaciones",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);

      if (granted) {
        toast({
          title: "Permiso concedido",
          description: "Ahora recibirás notificaciones importantes",
        });
      } else {
        toast({
          title: "Permiso denegado",
          description: "No recibirás notificaciones. Puedes cambiar esto en la configuración del navegador.",
          variant: "destructive"
        });
      }

      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error",
        description: "No se pudo solicitar permiso para notificaciones",
        variant: "destructive"
      });
      return false;
    }
  };

  // Agrega una nueva notificación
  const addNotification = (notification: Omit<Notification, "id" | "read" | "date">) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      read: false,
      date: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar notificación del sistema si hay permiso
    if (hasPermission && "Notification" in window) {
      const systemNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico"
      });

      systemNotification.onclick = () => {
        window.focus();
        markAsRead(newNotification.id);
      };
    }
  };

  // Marca una notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Elimina una notificación
  const deleteNotification = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  // Elimina todas las notificaciones
  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
    toast({
      title: "Notificaciones eliminadas",
      description: "Se han eliminado todas las notificaciones",
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        deleteNotification,
        markAsRead,
        clearAll,
        hasPermission,
        requestPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Hook para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};