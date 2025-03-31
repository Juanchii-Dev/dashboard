import { useState, useEffect } from "react";
import { 
  LightbulbIcon, TrendingUp, ShoppingBag, Coffee, Home, DollarSign,
  RefreshCcw, CircleDollarSign, Linkedin, Repeat, Calendar, Sparkles, Wallet
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotifications } from "@/context/notification-context";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { generateSavingSuggestions, SavingsSuggestion } from "@/lib/savings-service";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/chat-service";

// Función que retorna el icono adecuado según el tipo
function getSuggestionIcon(iconType?: string) {
  switch (iconType) {
    case "dollar":
      return <DollarSign className="h-5 w-5 text-green-500" />;
    case "coffee":
      return <Coffee className="h-5 w-5 text-amber-500" />;
    case "shopping":
      return <ShoppingBag className="h-5 w-5 text-blue-500" />;
    case "home":
      return <Home className="h-5 w-5 text-purple-500" />;
    case "trending":
      return <TrendingUp className="h-5 w-5 text-teal-500" />;
    case "circle-dollar":
      return <CircleDollarSign className="h-5 w-5 text-emerald-500" />;
    case "wallet":
      return <Wallet className="h-5 w-5 text-indigo-500" />;
    case "linkedin":
      return <Linkedin className="h-5 w-5 text-blue-600" />;
    case "repeat":
      return <Repeat className="h-5 w-5 text-orange-500" />;
    case "calendar":
      return <Calendar className="h-5 w-5 text-red-500" />;
    default:
      return <Sparkles className="h-5 w-5 text-yellow-500" />;
  }
}

export function SavingsSuggestionsWidget() {
  const [suggestions, setSuggestions] = useState<SavingsSuggestion[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Consulta para obtener datos de transacciones
  const { data: dashboardData, isLoading: isLoadingData } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: getDashboardData
  });

  // Obtener sugerencias de ahorro basadas en transacciones
  useEffect(() => {
    if (dashboardData?.recentTransactions) {
      fetchSavingSuggestions(dashboardData.recentTransactions);
    }
  }, [dashboardData]);

  // Función para obtener sugerencias
  const fetchSavingSuggestions = async (transactions: any[]) => {
    try {
      const savingSuggestions = await generateSavingSuggestions(transactions);
      setSuggestions(savingSuggestions);
    } catch (error) {
      console.error("Error al cargar sugerencias de ahorro:", error);
      addNotification({
        title: "Error",
        message: "No se pudieron generar las sugerencias de ahorro.",
        type: "error"
      });
    }
  };

  // Refrescar manualmente las sugerencias
  const refreshSuggestions = async () => {
    if (!dashboardData?.recentTransactions) return;
    
    setIsRefreshing(true);
    try {
      await fetchSavingSuggestions(dashboardData.recentTransactions);
      addNotification({
        title: "Sugerencias actualizadas",
        message: "Se han actualizado las sugerencias de ahorro con el último análisis de tus transacciones.",
        type: "success"
      });
    } catch (error) {
      console.error("Error al actualizar sugerencias:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrar sugerencias por categoría
  const filteredSuggestions = filter
    ? suggestions.filter(s => s.category === filter)
    : suggestions;

  // Obtener ahorro potencial total
  const totalPotentialSaving = filteredSuggestions.reduce(
    (total, suggestion) => total + suggestion.potentialSaving,
    0
  );

  // Aplicar una sugerencia
  const applySuggestion = (suggestion: SavingsSuggestion) => {
    addNotification({
      title: "Sugerencia de ahorro aplicada",
      message: `Has aplicado la sugerencia: ${suggestion.title}. Hemos registrado esta acción para tu seguimiento.`,
      type: "success"
    });
    
    // Aquí se podría implementar la lógica para guardar la sugerencia aplicada
  };

  // Color según dificultad
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Traducir dificultad
  const translateDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Media";
      case "hard":
        return "Difícil";
      default:
        return difficulty;
    }
  };

  // Renderizar el contenido según el estado
  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 w-full">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="w-full">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!suggestions.length) {
      return (
        <Alert>
          <AlertDescription className="text-center py-6">
            No se pudieron generar sugerencias de ahorro. Intenta actualizar los datos.
          </AlertDescription>
        </Alert>
      );
    }

    if (filteredSuggestions.length === 0) {
      return (
        <p className="text-center py-8 text-muted-foreground">
          No hay sugerencias disponibles en esta categoría.
        </p>
      );
    }
    
    return (
      filteredSuggestions.map(suggestion => (
        <Card key={suggestion.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="mt-1">
                  {getSuggestionIcon(suggestion.iconType)}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <Badge variant="outline" className="font-normal">
                      Ahorro: {formatCurrency(suggestion.potentialSaving)}/mes
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn("font-normal", getDifficultyColor(suggestion.difficulty))}
                    >
                      {translateDifficulty(suggestion.difficulty)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => applySuggestion(suggestion)}
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium">
            {isLoadingData 
              ? "Calculando ahorros..." 
              : `Ahorro potencial: ${formatCurrency(totalPotentialSaving)}/mes`}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={refreshSuggestions}
            disabled={isRefreshing || isLoadingData}
          >
            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          <Badge 
            variant={filter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(null)}
          >
            Todas
          </Badge>
          <Badge 
            variant={filter === "subscriptions" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("subscriptions")}
          >
            Suscripciones
          </Badge>
          <Badge 
            variant={filter === "habits" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("habits")}
          >
            Hábitos
          </Badge>
          <Badge 
            variant={filter === "expenses" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("expenses")}
          >
            Gastos
          </Badge>
          <Badge 
            variant={filter === "strategies" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("strategies")}
          >
            Estrategias
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {renderContent()}
      </div>
    </div>
  );
}