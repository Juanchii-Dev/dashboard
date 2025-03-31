import { useState, useEffect } from "react";
import { LightbulbIcon, TrendingUp, ShoppingBag, Coffee, Home, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/notification-context";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SavingsSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  difficulty: "easy" | "medium" | "hard";
  category: "subscriptions" | "habits" | "expenses" | "strategies";
  icon: React.ReactNode;
}

export function SavingsSuggestionsWidget() {
  const [suggestions, setSuggestions] = useState<SavingsSuggestion[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Generar sugerencias basadas en los datos financieros
  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    // En un caso real, estas sugerencias vendrían de un análisis de los datos financieros
    // Aquí simplemente definimos ejemplos para la demostración
    const demoSuggestions: SavingsSuggestion[] = [
      {
        id: "1",
        title: "Cancela suscripciones sin usar",
        description: "Identificamos 2 suscripciones con poco uso que podrías cancelar para ahorrar mensualmente.",
        potentialSaving: 24.99,
        difficulty: "easy",
        category: "subscriptions",
        icon: <DollarSign className="h-5 w-5 text-green-500" />
      },
      {
        id: "2",
        title: "Reduce gastos en café",
        description: "Preparando café en casa en lugar de comprarlo fuera podrías ahorrar significativamente.",
        potentialSaving: 45.50,
        difficulty: "medium",
        category: "habits",
        icon: <Coffee className="h-5 w-5 text-amber-500" />
      },
      {
        id: "3",
        title: "Compara precios de supermercados",
        description: "Usando aplicaciones de comparación de precios podrías ahorrar en tu compra semanal.",
        potentialSaving: 60.00,
        difficulty: "medium",
        category: "expenses",
        icon: <ShoppingBag className="h-5 w-5 text-blue-500" />
      },
      {
        id: "4",
        title: "Refinancia tu préstamo hipotecario",
        description: "Con las tasas actuales, refinanciar podría ahorrarte a largo plazo.",
        potentialSaving: 150.00,
        difficulty: "hard",
        category: "strategies",
        icon: <Home className="h-5 w-5 text-purple-500" />
      },
      {
        id: "5",
        title: "Automatiza transferencias a ahorro",
        description: "Configurar transferencias automáticas el día de cobro te ayudará a ahorrar sin pensarlo.",
        potentialSaving: 200.00,
        difficulty: "easy",
        category: "strategies",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />
      }
    ];

    setSuggestions(demoSuggestions);
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

  // Aplicar una sugerencia (en este caso solo muestra notificación)
  const applySuggestion = (suggestion: SavingsSuggestion) => {
    addNotification({
      title: "Sugerencia de ahorro aplicada",
      message: `Has aplicado la sugerencia: ${suggestion.title}`,
      type: "success"
    });
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium">Ahorro potencial: {formatCurrency(totalPotentialSaving)}/mes</h3>
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
        {filteredSuggestions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No hay sugerencias disponibles en esta categoría.
          </p>
        ) : (
          filteredSuggestions.map(suggestion => (
            <Card key={suggestion.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1">{suggestion.icon}</div>
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
        )}
      </div>
    </div>
  );
}