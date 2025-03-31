import { apiRequest } from "./queryClient";

// Tipos
export type BankProvider = {
  id: string;
  name: string;
  logo: string;
  description: string;
  availableFeatures: BankFeature[];
};

export type BankFeature = 
  | "balance-check" 
  | "transactions-history" 
  | "auto-categorization" 
  | "real-time-data" 
  | "budget-integration" 
  | "payments" 
  | "transfer";

export type BankAccount = {
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

export type BankConnectionStatus = 
  | "not-connected" 
  | "connecting" 
  | "connected" 
  | "disconnected" 
  | "error";

/**
 * Obtiene la lista de proveedores bancarios disponibles para integración
 */
export async function getAvailableBankProviders(): Promise<BankProvider[]> {
  try {
    const providers = await apiRequest("/api/bank/providers");
    return providers;
  } catch (error) {
    console.error("Error al obtener proveedores bancarios:", error);
    return [];
  }
}

/**
 * Inicia el proceso de autenticación con un proveedor bancario
 */
export async function initiateConnectionWithBank(
  providerId: string
): Promise<{ connectionId: string; authUrl: string }> {
  try {
    const result = await apiRequest(
      "/api/bank/connect", 
      "POST", 
      { providerId }
    );
    return result;
  } catch (error) {
    console.error("Error al iniciar conexión con banco:", error);
    throw new Error("No se pudo iniciar la conexión con el banco. Inténtalo de nuevo más tarde.");
  }
}

/**
 * Verifica el estado de una conexión después de la autenticación
 */
export async function verifyBankConnection(
  connectionId: string,
  authCode: string
): Promise<{ status: BankConnectionStatus; message?: string }> {
  try {
    const result = await apiRequest(
      "/api/bank/verify", 
      "POST", 
      { connectionId, authCode }
    );
    return result;
  } catch (error) {
    console.error("Error al verificar conexión bancaria:", error);
    return { status: "error", message: "No se pudo verificar la conexión. Inténtalo de nuevo más tarde." };
  }
}

/**
 * Obtiene las cuentas bancarias conectadas del usuario
 */
export async function getBankAccounts(): Promise<BankAccount[]> {
  try {
    const accounts = await apiRequest("/api/bank/accounts");
    return accounts;
  } catch (error) {
    console.error("Error al obtener cuentas bancarias:", error);
    return [];
  }
}

/**
 * Sincroniza los datos de todas las cuentas conectadas
 */
export async function synchronizeBankData(): Promise<{
  success: boolean;
  updatedAccounts: number;
  newTransactions: number;
  message?: string;
}> {
  try {
    const result = await apiRequest("/api/bank/sync", "POST");
    return result;
  } catch (error) {
    console.error("Error al sincronizar datos bancarios:", error);
    return {
      success: false,
      updatedAccounts: 0,
      newTransactions: 0,
      message: "No se pudieron sincronizar los datos bancarios. Inténtalo de nuevo más tarde."
    };
  }
}

/**
 * Desconecta una cuenta bancaria específica
 */
export async function disconnectBankAccount(accountId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await apiRequest(
      "/api/bank/disconnect", 
      "POST", 
      { accountId }
    );
    return result;
  } catch (error) {
    console.error("Error al desconectar cuenta bancaria:", error);
    return {
      success: false,
      message: "No se pudo desconectar la cuenta bancaria. Inténtalo de nuevo más tarde."
    };
  }
}

/**
 * Obtiene el listado de transacciones de una cuenta específica
 */
export async function getBankAccountTransactions(accountId: string, page = 1, limit = 20): Promise<{
  transactions: any[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const url = `/api/bank/transactions?accountId=${accountId}&page=${page}&limit=${limit}`;
    const result = await apiRequest(url);
    return result;
  } catch (error) {
    console.error("Error al obtener transacciones bancarias:", error);
    return {
      transactions: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  }
}

/**
 * Obtiene los detalles de una cuenta bancaria específica
 */
export async function getBankAccountDetails(accountId: string): Promise<BankAccount | null> {
  try {
    const account = await apiRequest(`/api/bank/account/${accountId}`);
    return account;
  } catch (error) {
    console.error("Error al obtener detalles de la cuenta bancaria:", error);
    return null;
  }
}