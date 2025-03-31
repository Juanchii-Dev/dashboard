import { apiRequest } from "./queryClient";
import { CATEGORIES, TIME_PERIODS } from "./constants";
import { 
  DashboardData, 
  Transaction,
  Budget,
  FinancialGoal,
  DebtSaving
} from "@/types/finance";

/**
 * Envía un mensaje al chatbot de asistencia financiera
 */
export async function sendChatMessage(message: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/chat", { message });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error sending chat message:", error);
    // Intentar un segundo intento con un timeout
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const retryResponse = await apiRequest("POST", "/api/chat", { message });
      const retryData = await retryResponse.json();
      return retryData.response;
    } catch (retryError) {
      console.error("Error en segundo intento:", retryError);
      return mockChatResponse(message);
    }
  }
}

/**
 * Obtiene los datos para el dashboard
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch("/api/dashboard");
    
    if (!response.ok) {
      throw new Error("Error fetching dashboard data");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Mock data for development until API is complete
    return {
      balance: 15300,
      monthlyIncome: 4500,
      monthlyExpenses: 2850,
      monthlySavings: 1650,
      incomeVsExpenses: {
        labels: ["Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre"],
        income: [3800, 4100, 3950, 4300, 4200, 4500],
        expenses: [2900, 3200, 2800, 3100, 2950, 2850]
      },
      expenseDistribution: [
        { name: "Vivienda", value: 35, color: "#4338ca" },
        { name: "Alimentación", value: 25, color: "#16a34a" },
        { name: "Transporte", value: 15, color: "#d97706" },
        { name: "Ocio", value: 10, color: "#db2777" },
        { name: "Servicios", value: 10, color: "#0ea5e9" },
        { name: "Otros", value: 5, color: "#64748b" }
      ],
      budgets: [
        { id: "1", name: "Alimentación", spent: 450, limit: 600, category: "food" },
        { id: "2", name: "Transporte", spent: 320, limit: 300, category: "transport" },
        { id: "3", name: "Ocio", spent: 170, limit: 250, category: "entertainment" },
        { id: "4", name: "Servicios", spent: 220, limit: 200, category: "utilities" }
      ],
      goals: [
        { id: "1", name: "Vacaciones", current: 1500, target: 2500, dueDate: "2023-12-31", category: "vacation" },
        { id: "2", name: "Nuevo coche", current: 3200, target: 15000, dueDate: "2024-06-30", category: "purchase" },
        { id: "3", name: "Curso de formación", current: 800, target: 1200, dueDate: "2023-11-30", category: "education" }
      ],
      recentTransactions: [
        { id: "1", description: "Supermercado El Corte", amount: -85.2, date: new Date().toISOString(), category: "food" },
        { id: "2", description: "Nómina Empresa S.L.", amount: 1500, date: new Date(Date.now() - 86400000).toISOString(), category: "salary" },
        { id: "3", description: "Restaurante La Mesa", amount: -56.8, date: "2023-10-21T21:45:00", category: "entertainment" },
        { id: "4", description: "Factura Telefónica", amount: -42.99, date: "2023-10-20T08:00:00", category: "utilities" },
        { id: "5", description: "Gasolinera Repsol", amount: -70.15, date: "2023-10-19T17:25:00", category: "transport" }
      ]
    };
  }
}

/**
 * Mock de respuesta del chatbot para desarrollo
 */
function mockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("ahorro") || lowerMessage.includes("ahorrar")) {
    return "Para ahorrar más, considera aplicar la regla 50/30/20: destina el 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorro. Según tus gastos recientes, podrías reducir en las categorías de Ocio y Servicios que están por encima de tu presupuesto.";
  } else if (lowerMessage.includes("deuda") || lowerMessage.includes("préstamo")) {
    return "Para gestionar mejor tus deudas, prioriza las que tienen intereses más altos. El método avalancha (pagar primero las deudas con intereses más altos) te ahorrará dinero a largo plazo.";
  } else if (lowerMessage.includes("inversion") || lowerMessage.includes("invertir")) {
    return "Para comenzar a invertir, primero asegúrate de tener un fondo de emergencia. Luego, considera inversiones diversificadas como fondos indexados o ETFs que se adapten a tu nivel de riesgo y horizonte temporal.";
  } else if (lowerMessage.includes("presupuesto")) {
    return "Revisa tus presupuestos actuales. Estás excediendo tu presupuesto en Transporte (106%) y Servicios (110%). Podría ayudarte a ajustarlos basándome en tus patrones de gasto de los últimos meses.";
  } else if (lowerMessage.includes("meta") || lowerMessage.includes("objetivo")) {
    return "Veo que tienes buena progresión en tus metas de ahorro. Para tu objetivo de 'Nuevo coche', podrías aumentar la aportación mensual en un 5% para alcanzarlo más rápido.";
  } else {
    return "Gracias por tu mensaje. ¿Puedes ser más específico sobre qué aspecto de tus finanzas te gustaría que te ayudara? Puedo aconsejarte sobre ahorro, deudas, inversiones, presupuestos o metas financieras.";
  }
}
