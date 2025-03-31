import { useState, useEffect } from "react";
import { Bell, X, Check, AlertTriangle, PiggyBank, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/context/notification-context";

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onDeleteNotification, 
  onClearAll 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Cierra el panel de notificaciones al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-center') && !target.closest('.notification-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtiene el icono según el tipo de notificación
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        // Asignar iconos según palabras clave en el mensaje
        if (notifications.find(n => n.type === type)?.message.toLowerCase().includes('meta')) {
          return <PiggyBank className="h-5 w-5 text-blue-500" />;
        } else if (notifications.find(n => n.type === type)?.message.toLowerCase().includes('pago')) {
          return <Calendar className="h-5 w-5 text-blue-500" />;
        } else if (notifications.find(n => n.type === type)?.message.toLowerCase().includes('presupuesto')) {
          return <CreditCard className="h-5 w-5 text-blue-500" />;
        } else {
          return <Bell className="h-5 w-5 text-blue-500" />;
        }
    }
  };

  // Maneja la acción de marcar como leída y mostrar un toast de confirmación
  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
    toast({
      title: "Notificación marcada como leída",
      description: "Esta notificación ha sido marcada como leída",
    });
  };

  // Maneja la eliminación de notificaciones con confirmación
  const handleDelete = (id: string) => {
    onDeleteNotification(id);
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido eliminada correctamente",
    });
  };

  // Formatea la fecha para mostrarla de forma amigable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <Button
        variant="ghost"
        size="icon"
        className="notification-button relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      
      {/* Panel de notificaciones */}
      {isOpen && (
        <Card className="notification-center absolute right-0 mt-2 w-80 sm:w-96 max-h-[28rem] overflow-hidden z-50 shadow-lg animate-in fade-in-50 zoom-in-95">
          <div className="p-3 border-b flex justify-between items-center">
            <div className="font-medium">Notificaciones</div>
            <div className="flex space-x-2">
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearAll}
                  className="text-xs h-7 px-2"
                >
                  Borrar todo
                </Button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[22rem]">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-muted-foreground">
                No tienes notificaciones
              </div>
            ) : (
              <CardContent className="p-0">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 border-b last:border-b-0 flex items-start gap-2 transition-colors",
                      !notification.read ? "bg-muted/50" : "hover:bg-muted/30",
                    )}
                  >
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm leading-none">
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como leída
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => handleDelete(notification.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}