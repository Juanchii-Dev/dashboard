import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BudgetForm } from "@/components/forms/budget-form";
import { GoalForm } from "@/components/forms/goal-form";
import { getDashboardData } from "@/lib/chat-service";
import { 
  Settings, 
  RefreshCcw,
  Plus,
  Grid3X3,
  PencilLine,
  RotateCcw,
  Layers
} from "lucide-react";
import { DashboardData, ExpenseCategory } from "@/types/finance";
import { useWidgets, Widget } from "@/context/widget-context";
import { WidgetRenderer } from "@/components/dashboard/widget-renderer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface WidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function WidgetCustomizationDialog({ isOpen, onClose }: WidgetDialogProps) {
  const { widgets, addWidget, updateWidget, resetToDefault } = useWidgets();
  const [activeTab, setActiveTab] = useState<string>("current");
  
  // Obtener los widgets visibles y ocultos
  const visibleWidgets = widgets.filter(w => w.visible);
  const hiddenWidgets = widgets.filter(w => !w.visible);
  
  // Manejador para cambiar la visibilidad de un widget
  const toggleWidgetVisibility = (id: string, visible: boolean) => {
    updateWidget(id, { visible });
  };
  
  // Manejador para cambiar el tamaño de un widget
  const changeWidgetSize = (id: string, size: Widget["size"]) => {
    updateWidget(id, { size });
  };
  
  // Restaurar configuración por defecto
  const handleReset = () => {
    resetToDefault();
    toast({
      title: "Configuración restablecida",
      description: "Se ha restaurado la configuración por defecto del dashboard",
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Personalizar Panel</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Configura qué widgets quieres ver en tu dashboard y cómo quieres organizarlos.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="current" className="text-xs sm:text-sm">Widgets Actuales</TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs sm:text-sm">Widgets Disponibles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h2 className="text-base sm:text-lg font-medium">Widgets Visibles ({visibleWidgets.length})</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar predeterminados
              </Button>
            </div>
            
            {visibleWidgets.length === 0 ? (
              <div className="py-8 sm:py-10 text-center border rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground px-2">No hay widgets visibles. Añade algunos desde la pestaña Widgets Disponibles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleWidgets
                  .sort((a, b) => a.position - b.position)
                  .map(widget => (
                    <Card key={widget.id} className="overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`visible-${widget.id}`} 
                              checked={widget.visible}
                              onCheckedChange={(checked) => toggleWidgetVisibility(widget.id, checked as boolean)}
                            />
                            <Label htmlFor={`visible-${widget.id}`} className="font-medium text-sm sm:text-base">{widget.title}</Label>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <Select 
                              value={widget.size} 
                              onValueChange={(value) => changeWidgetSize(widget.id, value as Widget["size"])}
                            >
                              <SelectTrigger className="w-[110px] sm:w-[120px] h-8 text-xs sm:text-sm">
                                <SelectValue placeholder="Tamaño" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Pequeño</SelectItem>
                                <SelectItem value="medium">Mediano</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs sm:text-sm"
                              onClick={() => toggleWidgetVisibility(widget.id, false)}
                            >
                              Ocultar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hidden" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-medium">Widgets Disponibles ({hiddenWidgets.length})</h2>
            </div>
            
            {hiddenWidgets.length === 0 ? (
              <div className="py-8 sm:py-10 text-center border rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground px-2">No hay widgets ocultos. Todos los widgets están visibles en el dashboard.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hiddenWidgets
                  .sort((a, b) => a.position - b.position)
                  .map(widget => (
                    <Card key={widget.id} className="overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id={`hidden-${widget.id}`} 
                              checked={widget.visible}
                              onCheckedChange={(checked) => toggleWidgetVisibility(widget.id, checked as boolean)}
                            />
                            <Label htmlFor={`hidden-${widget.id}`} className="font-medium text-sm sm:text-base">{widget.title}</Label>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs sm:text-sm w-full sm:w-auto"
                            onClick={() => toggleWidgetVisibility(widget.id, true)}
                          >
                            Mostrar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const { widgets, updateWidget } = useWidgets();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar los widgets visibles y ordenar por posición
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  // Manejador para eliminar un widget (cambia visibilidad a false)
  const handleRemoveWidget = (id: string) => {
    updateWidget(id, { visible: false });
  };

  // Manejador para cambiar el tamaño de un widget
  const handleSizeChange = (id: string, size: Widget["size"]) => {
    updateWidget(id, { size });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 pb-8 page-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Encabezado con botones de acción */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-gray-900 dark:text-white sm:text-2xl md:text-3xl">
                Panel Principal
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWidgetDialogOpen(true)}
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <Grid3X3 className="mr-2 h-4 w-4" />
                Personalizar panel
              </Button>
              <Button
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Actualizar datos
              </Button>
            </div>
          </div>

          {/* Dashboard de widgets */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            {visibleWidgets.length === 0 ? (
              <div className="col-span-12 py-10 sm:py-20 flex flex-col items-center justify-center text-center border rounded-md bg-muted/20">
                <Layers className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-medium mb-2">No hay widgets configurados</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md px-4">
                  Tu dashboard está vacío. Personaliza tu experiencia añadiendo algunos widgets para monitorizar tus finanzas.
                </p>
                <Button onClick={() => setIsWidgetDialogOpen(true)}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Personalizar widgets
                </Button>
              </div>
            ) : (
              visibleWidgets.map((widget) => (
                <WidgetRenderer
                  key={widget.id}
                  widget={widget}
                  onRemove={handleRemoveWidget}
                  onSizeChange={handleSizeChange}
                  isDraggable={false}
                />
              ))
            )}
          </div>

          {/* Botones para acciones rápidas en la parte inferior */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:flex sm:flex-wrap justify-center gap-2 sm:space-x-4">
            <Button 
              className="w-full sm:w-auto" 
              onClick={() => setIsTransactionFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar transacción
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto mt-2 sm:mt-0" 
              onClick={() => setIsBudgetFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo presupuesto
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto mt-2 sm:mt-0" 
              onClick={() => setIsGoalFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva meta
            </Button>
          </div>
        </div>
      </main>

      {/* Diálogos modales */}
      <WidgetCustomizationDialog 
        isOpen={isWidgetDialogOpen} 
        onClose={() => setIsWidgetDialogOpen(false)} 
      />
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onClose={() => setIsTransactionFormOpen(false)} 
      />
      <BudgetForm 
        isOpen={isBudgetFormOpen} 
        onClose={() => setIsBudgetFormOpen(false)} 
      />
      <GoalForm 
        isOpen={isGoalFormOpen} 
        onClose={() => setIsGoalFormOpen(false)} 
      />
    </>
  );
}