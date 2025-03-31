// Tipos para finanzas personales

// Mensajes del chat
export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

// Transacciones
export interface Transaction {
  id: string;
  description: string;
  amount: number; // positivo para ingresos, negativo para gastos
  date: string;
  category: string;
}

// Presupuestos
export interface Budget {
  id: string;
  name: string;
  spent: number;
  limit: number;
  category: string;
}

// Metas financieras
export interface FinancialGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  dueDate: string;
  category: string;
}

// Deudas y ahorros
export interface DebtSaving {
  id: string;
  name: string;
  amount: number;
  interestRate?: number;
  dueDate?: string;
  type: "debt" | "saving";
  category: string;
}

// Distribución de gastos
export interface ExpenseCategory {
  name: string;
  value: number;
  color?: string;
}

// Datos para el dashboard
export interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  incomeVsExpenses: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
  expenseDistribution: ExpenseCategory[];
  budgets: Budget[];
  goals: FinancialGoal[];
  recentTransactions: Transaction[];
}
