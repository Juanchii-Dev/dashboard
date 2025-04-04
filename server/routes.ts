import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { ZodError } from "zod";
import * as bankConnections from "./bank-connections";
import { 
  registerUserSchema,
  registerUserSchemaBackend,
  loginSchema, 
  twoFactorSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "@shared/schema";
import * as authService from "./services/auth-service";

// Extender Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Inicializar OpenAI para el chatbot
// Comprobamos que la clave API exista o usamos un valor predeterminado
// que activará el modo de respaldo
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Función auxiliar para manejo de errores
  const handleError = (res: Response, error: unknown) => {
    console.error("Error en la API:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Error de validación", 
        errors: error.errors 
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json({ message: errorMessage });
  };

  // Middleware para verificar la autenticación
  const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = authService.verifyJWT(token);
    
    if (!payload) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    
    req.user = payload;
    next();
  };

  // Rutas de autenticación
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Validar los datos del formulario con el esquema completo (incluye confirmPassword)
      const validatedData = registerUserSchema.parse(req.body);
      
      // Usar el esquema sin confirmPassword para autenticación
      const userData = registerUserSchemaBackend.parse(validatedData);
      
      const result = await authService.registerUser(storage, userData);
      
      res.status(201).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          name: result.user.name,
          email_verified: result.user.email_verified
        },
        token: result.token,
        message: "Usuario registrado exitosamente."
      });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const { email, password } = credentials;
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"];
      
      const result = await authService.loginUser(storage, email, password, ipAddress, userAgent);
      
      if (result.requireTwoFactor) {
        return res.status(200).json({
          requireTwoFactor: true,
          message: "Se requiere verificación de dos factores. Se ha enviado un código a tu correo electrónico."
        });
      }
      
      res.status(200).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          name: result.user.name,
          email_verified: result.user.email_verified
        },
        token: result.token,
        message: "Inicio de sesión exitoso",
        redirect: "/dashboard"
      });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/verify-two-factor", async (req: Request, res: Response) => {
    try {
      const twoFactorData = twoFactorSchema.parse(req.body);
      const result = await authService.verifyTwoFactorCode(
        storage, 
        twoFactorData.email, 
        twoFactorData.code
      );
      
      res.status(200).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          name: result.user.name,
          email_verified: result.user.email_verified
        },
        token: result.token,
        message: "Verificación exitosa"
      });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token no proporcionado" });
      }
      
      const success = await authService.verifyEmail(storage, token);
      
      if (!success) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }
      
      res.status(200).json({ message: "Email verificado exitosamente" });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      await authService.requestPasswordReset(storage, email);
      
      // Siempre devolver éxito aunque el correo no exista (seguridad)
      res.status(200).json({ 
        message: "Si el correo electrónico existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña" 
      });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const success = await authService.resetPassword(storage, token, password);
      
      if (!success) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }
      
      res.status(200).json({ message: "Contraseña restablecida exitosamente" });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/logout", verifyAuth, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader!.split(' ')[1];
      
      await authService.logoutUser(storage, token);
      
      res.status(200).json({ message: "Sesión cerrada exitosamente" });
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas API para el dashboard
  app.get("/api/dashboard", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Obtenemos el userId del usuario autenticado
      const userId = req.user.id; 
      const dashboardData = await storage.getDashboardData(userId);
      res.status(200).json(dashboardData);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas API para transacciones
  app.get("/api/transactions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getTransactions(userId);
      res.status(200).json(transactions);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/transactions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const transaction = await storage.createTransaction({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(transaction);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas API para presupuestos
  app.get("/api/budgets", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const budgets = await storage.getBudgets(userId);
      res.status(200).json(budgets);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/budgets", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const budget = await storage.createBudget({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(budget);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas API para metas financieras
  app.get("/api/goals", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const goals = await storage.getGoals(userId);
      res.status(200).json(goals);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/goals", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const goal = await storage.createGoal({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(goal);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas API para deudas y ahorros
  app.get("/api/debts-savings", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const debtsSavings = await storage.getDebtsSavings(userId);
      res.status(200).json(debtsSavings);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  app.post("/api/debts-savings", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const debtSaving = await storage.createDebtSaving({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(debtSaving);
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Ruta API para el chatbot
  app.post("/api/chat", verifyAuth, async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;

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

          // Asegurarse de que nunca sea null
          const content = response.choices[0]?.message?.content;
          botResponse = content || getDefaultBotResponse(message);
        } catch (error: unknown) {
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
    } catch (error: unknown) {
      handleError(res, error);
    }
  });
  
  // Nueva ruta para generar sugerencias de ahorro con OpenAI
  app.post("/api/savings-suggestions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const { transactions, preferences } = req.body;
      
      // Si no hay API key o es demo, devolvemos datos de ejemplo
      if (!openai.apiKey || openai.apiKey === "sk-demo-key") {
        return res.status(200).json({
          suggestions: getMockSavingSuggestions()
        });
      }
      
      try {
        // Usar OpenAI para generar sugerencias personalizadas
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
              content: `Analiza estas transacciones y sugiere formas de ahorrar dinero:\n${transactions}`
            }
          ],
          response_format: { type: "json_object" }
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error("No se recibió respuesta de OpenAI");
        }
        
        const result = JSON.parse(response.choices[0].message.content);
        
        // Asignar IDs a las sugerencias si es necesario
        const suggestions = result.suggestions?.map((suggestion: any, index: number) => ({
          id: `ai-suggestion-${index + 1}`,
          ...suggestion
        })) || [];
        
        return res.status(200).json({ suggestions });
      } catch (error: unknown) {
        console.error("Error generando sugerencias con OpenAI:", error);
        // En caso de error, devolver ejemplos
        return res.status(200).json({
          suggestions: getMockSavingSuggestions()
        });
      }
    } catch (error: unknown) {
      handleError(res, error);
    }
  });

  // Rutas para API de conexión bancaria - Aplicamos autenticación a todas excepto obtener proveedores
  app.get("/api/bank/providers", bankConnections.getProviders);
  app.post("/api/bank/connect", verifyAuth, (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  }, bankConnections.connectToBank);
  app.post("/api/bank/verify", verifyAuth, (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  }, bankConnections.verifyConnection);
  app.get("/api/bank/accounts", verifyAuth, (req, res, next) => {
    req.query.userId = req.user.id.toString();
    next();
  }, bankConnections.getAccounts);
  app.post("/api/bank/sync", verifyAuth, (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  }, bankConnections.syncBankData);
  app.post("/api/bank/disconnect", verifyAuth, (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  }, bankConnections.disconnectAccount);
  app.get("/api/bank/account/:accountId", verifyAuth, (req, res, next) => {
    req.query.userId = req.user.id.toString();
    next();
  }, bankConnections.getAccountDetails);
  app.get("/api/bank/transactions", verifyAuth, (req, res, next) => {
    req.query.userId = req.user.id.toString();
    next();
  }, bankConnections.getAccountTransactions);

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

// Función para generar sugerencias de ahorro cuando no hay OpenAI
function getMockSavingSuggestions() {
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
