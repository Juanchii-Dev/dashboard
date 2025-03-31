import { Transaction } from "@/types/finance";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "./queryClient";

export interface SavingsSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  difficulty: "easy" | "medium" | "hard";
  category: "subscriptions" | "habits" | "expenses" | "strategies";
  iconType?: string;
}

/**
 * Analiza las transacciones del usuario y genera sugerencias de ahorro personalizadas
 */
export async function generateSavingSuggestions(
  transactions: Transaction[], 
  userPreferences?: any
): Promise<SavingsSuggestion[]> {
  try {
    // Preparar el contexto para la API
    const transactionContext = transactions
      .slice(0, 20)
      .map(t => `${t.description}: ${t.amount}€ (${t.date})`)
      .join("\n");
    
    // Enviar al servidor para procesar con OpenAI
    const data = await apiRequest(
      "/api/savings-suggestions", 
      "POST", 
      {
        transactions: transactionContext,
        preferences: userPreferences
      }
    );
    
    // Devolver las sugerencias con su formato original
    return data.suggestions;
  } catch (error) {
    console.error("Error generando sugerencias de ahorro:", error);
    toast({
      title: "Error al generar sugerencias",
      description: "No se pudieron generar sugerencias de ahorro. Utilizando ejemplos predeterminados.",
      variant: "destructive"
    });
    
    // En caso de error, devolver sugerencias de ejemplo
    return getMockSavingSuggestions();
  }
}

/**
 * Proporciona sugerencias de ahorro de ejemplo cuando no se puede utilizar la API
 */
function getMockSavingSuggestions(): SavingsSuggestion[] {
  return [
    {
      id: "1",
      title: "Cancela suscripciones sin usar",
      description: "Identificamos 2 suscripciones con poco uso que podrías cancelar para ahorrar mensualmente.",
      potentialSaving: 24.99,
      difficulty: "easy",
      category: "subscriptions",
      iconType: "dollar"
    },
    {
      id: "2",
      title: "Reduce gastos en café",
      description: "Preparando café en casa en lugar de comprarlo fuera podrías ahorrar significativamente.",
      potentialSaving: 45.50,
      difficulty: "medium",
      category: "habits",
      iconType: "coffee"
    },
    {
      id: "3",
      title: "Compara precios de supermercados",
      description: "Usando aplicaciones de comparación de precios podrías ahorrar en tu compra semanal.",
      potentialSaving: 60.00,
      difficulty: "medium",
      category: "expenses",
      iconType: "shopping"
    },
    {
      id: "4",
      title: "Refinancia tu préstamo hipotecario",
      description: "Con las tasas actuales, refinanciar podría ahorrarte a largo plazo.",
      potentialSaving: 150.00,
      difficulty: "hard",
      category: "strategies",
      iconType: "home"
    },
    {
      id: "5",
      title: "Automatiza transferencias a ahorro",
      description: "Configurar transferencias automáticas el día de cobro te ayudará a ahorrar sin pensarlo.",
      potentialSaving: 200.00,
      difficulty: "easy",
      category: "strategies",
      iconType: "trending"
    }
  ];
}