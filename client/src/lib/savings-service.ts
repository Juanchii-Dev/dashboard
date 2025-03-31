import OpenAI from "openai";
import { Transaction } from "@/types/finance";
import { toast } from "@/hooks/use-toast";

// Inicializar cliente de OpenAI
// Nota: el modelo más reciente es "gpt-4o" que se lanzó después de tu fecha de corte. Siempre usa gpt-4o ya que es el último modelo.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true
});

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
    // Si no hay API key o estamos en desarrollo, usamos datos dummy
    if (!process.env.OPENAI_API_KEY) {
      return getMockSavingSuggestions();
    }
    
    // Preparar el contexto para la API
    const transactionContext = transactions
      .slice(0, 20)
      .map(t => `${t.description}: ${t.amount}€ (${t.date})`)
      .join("\n");
    
    // Generar sugerencias usando OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres un asesor financiero experto que analiza patrones de gasto para ofrecer consejos personalizados de ahorro.
          Debes generar 5 sugerencias de ahorro en base a las transacciones proporcionadas.
          Para cada sugerencia, debes indicar: un título corto, una descripción más detallada, el ahorro potencial mensual en euros,
          nivel de dificultad (easy, medium, hard) y categoría (subscriptions, habits, expenses, strategies).
          También sugiere un tipo de icono para cada sugerencia que sea relevante. Responde solo en formato JSON.`
        },
        {
          role: "user",
          content: `Analiza estas transacciones y sugiere formas de ahorrar dinero:\n${transactionContext}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Asignar IDs a las sugerencias
    return result.suggestions.map((suggestion: any, index: number) => ({
      id: `ai-suggestion-${index + 1}`,
      ...suggestion
    }));
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