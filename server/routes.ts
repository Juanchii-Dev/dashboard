import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Inicializar OpenAI para el chatbot
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Rutas API para usuarios
  app.post("/api/register", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        res.status(401).json({ message: "Credenciales inválidas" });
        return;
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rutas API para el dashboard
  app.get("/api/dashboard", async (req, res) => {
    try {
      // En una app real, obtendríamos el userId de la sesión
      const userId = 1; // Usuario de ejemplo
      const dashboardData = await storage.getDashboardData(userId);
      res.status(200).json(dashboardData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rutas API para transacciones
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const transactions = await storage.getTransactions(userId);
      res.status(200).json(transactions);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const transaction = await storage.createTransaction({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rutas API para presupuestos
  app.get("/api/budgets", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const budgets = await storage.getBudgets(userId);
      res.status(200).json(budgets);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const budget = await storage.createBudget({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rutas API para metas financieras
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const goals = await storage.getGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const goal = await storage.createGoal({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rutas API para deudas y ahorros
  app.get("/api/debts-savings", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const debtsSavings = await storage.getDebtsSavings(userId);
      res.status(200).json(debtsSavings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/debts-savings", async (req, res) => {
    try {
      const userId = 1; // Usuario de ejemplo
      const debtSaving = await storage.createDebtSaving({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(debtSaving);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Ruta API para el chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const userId = 1; // Usuario de ejemplo

      // Almacenar mensaje del usuario
      await storage.createChatMessage({
        content: message,
        role: "user",
        user_id: userId,
      });

      // Si tenemos API key, usamos OpenAI para la respuesta
      let botResponse = "";
      if (openai.apiKey && openai.apiKey !== "sk-demo-key") {
        try {
          // el modelo más nuevo de OpenAI es "gpt-4o" lanzado el 13 de mayo de 2024
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `Eres un asistente financiero experto. Proporciona consejos útiles y personalizados sobre finanzas personales. 
                 Responde siempre en español de forma clara, concisa y amigable. Adapta tus respuestas al contexto financiero con consejos prácticos.`,
              },
              { role: "user", content: message },
            ],
            max_tokens: 300,
          });

          botResponse = response.choices[0].message.content;
        } catch (error) {
          console.error("Error con OpenAI:", error);
          botResponse = getDefaultBotResponse(message);
        }
      } else {
        // Fallback para respuestas si no hay API key
        botResponse = getDefaultBotResponse(message);
      }

      // Almacenar respuesta del bot
      await storage.createChatMessage({
        content: botResponse,
        role: "bot",
        user_id: userId,
      });

      res.status(200).json({ response: botResponse });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Función auxiliar para generar respuestas del chatbot cuando no hay API key
function getDefaultBotResponse(message: string): string {
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
