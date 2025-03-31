import { Request, Response } from "express";
import { faker } from "@faker-js/faker";

// Tipos
type BankProvider = {
  id: string;
  name: string;
  logo: string;
  description: string;
  availableFeatures: string[];
};

type BankAccount = {
  id: string;
  accountNumber: string;
  name: string;
  type: "current" | "savings" | "investment" | "credit" | "loan";
  balance: number;
  currency: string;
  bankName: string;
  bankLogo: string;
  lastUpdated: string;
  isConnected: boolean;
};

// Datos mockeados para desarrollo
const mockProviders: BankProvider[] = [
  {
    id: "bbva",
    name: "BBVA",
    logo: "https://cdn.iconscout.com/icon/free/png-256/free-bbva-283416.png?f=webp",
    description: "Conecta tus cuentas BBVA para gestionar tus finanzas de forma integrada.",
    availableFeatures: ["balance-check", "transactions-history", "auto-categorization", "real-time-data"]
  },
  {
    id: "santander",
    name: "Santander",
    logo: "https://cdn.iconscout.com/icon/free/png-256/free-banco-santander-282418.png?f=webp",
    description: "Visualiza tu dinero, transacciones y gestiona tus finanzas con datos sincronizados de Santander.",
    availableFeatures: ["balance-check", "transactions-history", "budget-integration"]
  },
  {
    id: "caixabank",
    name: "CaixaBank",
    logo: "https://cdn.iconscout.com/icon/premium/png-256-thumb/caixa-bank-2974222-2476577.png?f=webp",
    description: "Accede a tus cuentas de CaixaBank para un seguimiento financiero completo.",
    availableFeatures: ["balance-check", "transactions-history", "auto-categorization"]
  },
  {
    id: "sabadell",
    name: "Banco Sabadell",
    logo: "https://cdn.iconscout.com/icon/free/png-256/free-banco-sabadell-282422.png?f=webp",
    description: "Conecta tus cuentas de Banco Sabadell y mantén el control de tus finanzas personales.",
    availableFeatures: ["balance-check", "transactions-history", "payments"]
  },
  {
    id: "bankinter",
    name: "Bankinter",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Bankinter.svg/2048px-Bankinter.svg.png",
    description: "Visualiza tus cuentas de Bankinter y analiza tus hábitos de gasto en tiempo real.",
    availableFeatures: ["balance-check", "transactions-history", "real-time-data"]
  },
  {
    id: "ing",
    name: "ING",
    logo: "https://cdn.icon-icons.com/icons2/2699/PNG/512/ing_logo_icon_169594.png",
    description: "Conecta con tu cuenta naranja de ING y gestiona tu dinero de manera inteligente.",
    availableFeatures: ["balance-check", "transactions-history", "auto-categorization", "budget-integration"]
  }
];

// Función para generar transacciones demo para una cuenta
function generateDemoTransactions(accountId: string, count = 20) {
  const transactions = [];
  
  for (let i = 0; i < count; i++) {
    const date = faker.date.recent(30);
    const isIncome = Math.random() > 0.7;
    const categories = isIncome 
      ? ["Ingresos", "Nómina", "Transferencia", "Devolución", "Otros ingresos"] 
      : ["Alimentación", "Transporte", "Ocio", "Hogar", "Salud", "Compras", "Servicios", "Otros gastos"];
    
    transactions.push({
      id: faker.string.uuid(),
      accountId: accountId,
      date: date.toISOString(),
      description: isIncome 
        ? faker.finance.transactionDescription() 
        : faker.company.name(),
      amount: isIncome 
        ? faker.number.float({ min: 50, max: 2000, precision: 0.01 }) 
        : -faker.number.float({ min: 5, max: 200, precision: 0.01 }),
      balance: faker.number.float({ min: 500, max: 5000, precision: 0.01 }),
      category: faker.helpers.arrayElement(categories),
      status: faker.helpers.arrayElement(["completed", "pending"]),
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Almacén local de cuentas para simulación
let mockAccounts: BankAccount[] = [
  {
    id: "acc_bbva1",
    accountNumber: "ES2101827182390123456789",
    name: "Cuenta Online",
    type: "current",
    balance: 3540.75,
    currency: "EUR",
    bankName: "BBVA",
    bankLogo: "https://cdn.iconscout.com/icon/free/png-256/free-bbva-283416.png?f=webp",
    lastUpdated: new Date().toISOString(),
    isConnected: true
  },
  {
    id: "acc_ing1",
    accountNumber: "ES1724871000052344891475",
    name: "Cuenta Naranja",
    type: "savings",
    balance: 12750.50,
    currency: "EUR",
    bankName: "ING",
    bankLogo: "https://cdn.icon-icons.com/icons2/2699/PNG/512/ing_logo_icon_169594.png",
    lastUpdated: new Date().toISOString(),
    isConnected: true
  }
];

// Manejadores de endpoint
export const getProviders = async (_req: Request, res: Response) => {
  try {
    res.json(mockProviders);
  } catch (error) {
    console.error("Error al obtener proveedores bancarios:", error);
    res.status(500).json({ success: false, message: "Error al obtener proveedores bancarios" });
  }
};

export const connectToBank = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere el ID del proveedor bancario" 
      });
    }
    
    // Buscar si el proveedor existe
    const provider = mockProviders.find(p => p.id === providerId);
    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: "Proveedor bancario no encontrado" 
      });
    }
    
    // Generar un ID de conexión único
    const connectionId = `conn_${providerId}_${Date.now()}`;
    
    // En un entorno real, aquí se generaría una URL de autenticación con el proveedor bancario
    // Para la demo, retornamos una URL simulada
    const authUrl = `/api/demo/bank-auth?provider=${providerId}&connection_id=${connectionId}`;
    
    res.json({ connectionId, authUrl });
  } catch (error) {
    console.error("Error al iniciar conexión bancaria:", error);
    res.status(500).json({ success: false, message: "Error al iniciar conexión bancaria" });
  }
};

export const verifyConnection = async (req: Request, res: Response) => {
  try {
    const { connectionId, authCode } = req.body;
    
    if (!connectionId || !authCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Se requieren connectionId y authCode" 
      });
    }
    
    // Extraer el providerId del connectionId (formato: conn_providerId_timestamp)
    const providerId = connectionId.split('_')[1];
    const provider = mockProviders.find(p => p.id === providerId);
    
    if (!provider) {
      return res.json({ status: "error", message: "Proveedor no encontrado" });
    }
    
    // Simular creación de cuenta
    const newAccountId = `acc_${providerId}${mockAccounts.filter(a => a.bankName.toLowerCase() === providerId).length + 1}`;
    const accountType = faker.helpers.arrayElement<BankAccount['type']>(["current", "savings", "investment", "credit", "loan"]);
    
    // Mapeo de tipos de cuenta a nombres en español
    const accountTypeMap: Record<BankAccount['type'], string> = {
      current: "Cuenta Corriente",
      savings: "Cuenta de Ahorro",
      investment: "Cuenta de Inversión",
      credit: "Tarjeta de Crédito", 
      loan: "Préstamo"
    };
    
    const accountTypeName = accountTypeMap[accountType];
    
    const newAccount: BankAccount = {
      id: newAccountId,
      accountNumber: `ES${faker.string.numeric(22)}`,
      name: accountTypeName,
      type: accountType,
      balance: accountType === "credit" ? -faker.number.float({ min: 100, max: 2000, precision: 0.01 }) : faker.number.float({ min: 500, max: 15000, precision: 0.01 }),
      currency: "EUR",
      bankName: provider.name,
      bankLogo: provider.logo,
      lastUpdated: new Date().toISOString(),
      isConnected: true
    };
    
    // Agregar la cuenta solo si no existe una del mismo tipo para ese banco
    const existingAccount = mockAccounts.find(a => 
      a.bankName === provider.name && 
      a.type === accountType
    );
    
    if (!existingAccount) {
      mockAccounts.push(newAccount);
    }
    
    res.json({ status: "connected" });
  } catch (error) {
    console.error("Error al verificar conexión bancaria:", error);
    res.status(500).json({ status: "error", message: "Error al verificar conexión bancaria" });
  }
};

export const getAccounts = async (_req: Request, res: Response) => {
  try {
    res.json(mockAccounts);
  } catch (error) {
    console.error("Error al obtener cuentas bancarias:", error);
    res.status(500).json({ success: false, message: "Error al obtener cuentas bancarias" });
  }
};

export const syncBankData = async (_req: Request, res: Response) => {
  try {
    // Simulamos actualización de datos
    const updatedAccounts = mockAccounts.length;
    const newTransactionsCount = faker.number.int({ min: 0, max: 10 });
    
    // Actualizar la fecha de última actualización de las cuentas
    mockAccounts = mockAccounts.map(account => ({
      ...account,
      lastUpdated: new Date().toISOString(),
      // Ocasionalmente actualizamos el balance para simular cambios
      balance: Math.random() > 0.5 
        ? account.balance 
        : account.type === "credit"
          ? -faker.number.float({ min: 100, max: 2000, precision: 0.01 })
          : faker.number.float({ min: 500, max: 15000, precision: 0.01 })
    }));
    
    res.json({ 
      success: true, 
      updatedAccounts, 
      newTransactions: newTransactionsCount,
      message: newTransactionsCount > 0 
        ? `Se han sincronizado ${updatedAccounts} cuentas y se encontraron ${newTransactionsCount} nuevas transacciones.`
        : `Se han sincronizado ${updatedAccounts} cuentas. No hay nuevas transacciones.`
    });
  } catch (error) {
    console.error("Error al sincronizar datos bancarios:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al sincronizar datos bancarios" 
    });
  }
};

export const disconnectAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere el ID de la cuenta" 
      });
    }
    
    const accountIndex = mockAccounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Cuenta no encontrada" 
      });
    }
    
    // Marcar como desconectada en lugar de eliminarla
    mockAccounts[accountIndex] = {
      ...mockAccounts[accountIndex],
      isConnected: false
    };
    
    res.json({ 
      success: true, 
      message: "Cuenta desconectada correctamente" 
    });
  } catch (error) {
    console.error("Error al desconectar cuenta:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al desconectar la cuenta bancaria" 
    });
  }
};

export const getAccountTransactions = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    if (!accountId) {
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere el ID de la cuenta" 
      });
    }
    
    const account = mockAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        message: "Cuenta no encontrada" 
      });
    }
    
    // Generar transacciones demo para la cuenta
    const allTransactions = generateDemoTransactions(accountId as string, 50);
    
    // Paginar resultados
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const transactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      transactions,
      total: allTransactions.length,
      page,
      totalPages: Math.ceil(allTransactions.length / limit)
    });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener transacciones de la cuenta" 
    });
  }
};

export const getAccountDetails = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    
    if (!accountId) {
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere el ID de la cuenta" 
      });
    }
    
    const account = mockAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      return res.status(404).json({ 
        success: false, 
        message: "Cuenta no encontrada" 
      });
    }
    
    res.json(account);
  } catch (error) {
    console.error("Error al obtener detalles de la cuenta:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener detalles de la cuenta" 
    });
  }
};