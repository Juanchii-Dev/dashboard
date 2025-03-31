import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

// Tipos de widgets disponibles
export type WidgetType = 
  | "balance" 
  | "income-expense" 
  | "expense-distribution" 
  | "recent-transactions" 
  | "budgets" 
  | "goals" 
  | "debt-savings" 
  | "calendar" 
  | "financial-health" 
  | "savings-suggestions"
  | "investment-tips";

// Definición de un widget
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: number;
  size: "small" | "medium" | "large";
  visible: boolean;
}

interface WidgetContextType {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, "id">) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Omit<Widget, "id">>) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  resetToDefault: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Definición de widgets por defecto
const defaultWidgets: Omit<Widget, "id">[] = [
  {
    type: "balance",
    title: "Balance General",
    position: 0,
    size: "small",
    visible: true
  },
  {
    type: "income-expense",
    title: "Ingresos vs Gastos",
    position: 1,
    size: "medium",
    visible: true
  },
  {
    type: "expense-distribution",
    title: "Distribución de Gastos",
    position: 2,
    size: "medium",
    visible: true
  },
  {
    type: "recent-transactions",
    title: "Transacciones Recientes",
    position: 3,
    size: "large",
    visible: true
  },
  {
    type: "budgets",
    title: "Presupuestos",
    position: 4,
    size: "medium",
    visible: true
  },
  {
    type: "goals",
    title: "Metas Financieras",
    position: 5,
    size: "medium",
    visible: true
  },
  {
    type: "debt-savings",
    title: "Deudas y Ahorros",
    position: 6,
    size: "medium",
    visible: false
  },
  {
    type: "financial-health",
    title: "Salud Financiera",
    position: 7,
    size: "small",
    visible: false
  },
  {
    type: "savings-suggestions",
    title: "Sugerencias de Ahorro",
    position: 8,
    size: "medium",
    visible: false
  },
  {
    type: "investment-tips",
    title: "Consejos de Inversión",
    position: 9,
    size: "medium",
    visible: false
  }
];

interface WidgetProviderProps {
  children: ReactNode;
}

export function WidgetProvider({ children }: WidgetProviderProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Cargar widgets guardados o usar defaults al iniciar
  useEffect(() => {
    loadWidgets();
  }, []);

  // Guardar widgets en localStorage cuando cambien
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboard_widgets', JSON.stringify(widgets));
    }
  }, [widgets]);

  // Carga widgets del localStorage o crea los predeterminados
  const loadWidgets = () => {
    try {
      const savedWidgets = localStorage.getItem('dashboard_widgets');
      if (savedWidgets) {
        setWidgets(JSON.parse(savedWidgets));
      } else {
        // Crear widgets por defecto con IDs únicos
        setWidgets(defaultWidgets.map(widget => ({ ...widget, id: uuidv4() })));
      }
    } catch (error) {
      console.error("Error loading widgets:", error);
      // Fallback a widgets por defecto
      setWidgets(defaultWidgets.map(widget => ({ ...widget, id: uuidv4() })));
    }
  };

  // Añadir un nuevo widget
  const addWidget = (widget: Omit<Widget, "id">) => {
    const newWidget = { ...widget, id: uuidv4() };
    setWidgets(prevWidgets => [...prevWidgets, newWidget]);
  };

  // Eliminar un widget
  const removeWidget = (id: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== id));
  };

  // Actualizar un widget existente
  const updateWidget = (id: string, updates: Partial<Omit<Widget, "id">>) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    );
  };

  // Reordenar widgets
  const reorderWidgets = (orderedIds: string[]) => {
    // Creamos un mapa para asignar posiciones según el orden
    const positionMap = orderedIds.reduce((map, id, index) => {
      map[id] = index;
      return map;
    }, {} as Record<string, number>);

    // Actualizamos las posiciones de los widgets
    setWidgets(prevWidgets => 
      [...prevWidgets].map(widget => ({
        ...widget,
        position: positionMap[widget.id] !== undefined 
          ? positionMap[widget.id] 
          : widget.position
      })).sort((a, b) => a.position - b.position)
    );
  };

  // Restaurar a configuración por defecto
  const resetToDefault = () => {
    const defaultWithIds = defaultWidgets.map(widget => ({ ...widget, id: uuidv4() }));
    setWidgets(defaultWithIds);
    localStorage.setItem('dashboard_widgets', JSON.stringify(defaultWithIds));
  };

  return (
    <WidgetContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        updateWidget,
        reorderWidgets,
        resetToDefault
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

// Hook para usar el contexto
export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidgets must be used within a WidgetProvider");
  }
  return context;
};