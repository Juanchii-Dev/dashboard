import { 
  users, 
  categories, 
  transactions, 
  budgets, 
  goals, 
  debts_savings, 
  chat_messages,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type DebtSaving,
  type InsertDebtSaving,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // Usuarios
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  
  // Categorías
  getCategories(userId: number): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Transacciones
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Presupuestos
  getBudgets(userId: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  
  // Metas financieras
  getGoals(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(id: number, currentAmount: number): Promise<Goal>;
  
  // Deudas y ahorros
  getDebtsSavings(userId: number): Promise<DebtSaving[]>;
  getDebtSavingById(id: number): Promise<DebtSaving | undefined>;
  createDebtSaving(debtSaving: InsertDebtSaving): Promise<DebtSaving>;
  
  // Chat
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Dashboard
  getDashboardData(userId: number): Promise<any>;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private categoryMap: Map<number, Category>;
  private transactionMap: Map<number, Transaction>;
  private budgetMap: Map<number, Budget>;
  private goalMap: Map<number, Goal>;
  private debtSavingMap: Map<number, DebtSaving>;
  private chatMessageMap: Map<number, ChatMessage>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private transactionIdCounter: number;
  private budgetIdCounter: number;
  private goalIdCounter: number;
  private debtSavingIdCounter: number;
  private chatMessageIdCounter: number;
  
  constructor() {
    this.userMap = new Map();
    this.categoryMap = new Map();
    this.transactionMap = new Map();
    this.budgetMap = new Map();
    this.goalMap = new Map();
    this.debtSavingMap = new Map();
    this.chatMessageMap = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.transactionIdCounter = 1;
    this.budgetIdCounter = 1;
    this.goalIdCounter = 1;
    this.debtSavingIdCounter = 1;
    this.chatMessageIdCounter = 1;
    
    // Inicializar con datos de ejemplo
    this.initializeData();
  }
  
  // Inicializar datos de ejemplo
  private initializeData() {
    // Crear usuario de ejemplo
    const exampleUser: InsertUser = {
      username: "carlos",
      password: "123456", // En producción usaríamos hash
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
    };
    
    this.createUser(exampleUser);
  }
  
  // Implementación de métodos para usuarios
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.userMap.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      created_at: now,
    };
    
    this.userMap.set(id, user);
    return user;
  }
  
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }
  
  // Implementación de métodos para categorías
  async getCategories(userId: number): Promise<Category[]> {
    const categories: Category[] = [];
    for (const category of this.categoryMap.values()) {
      if (category.user_id === userId) {
        categories.push(category);
      }
    }
    return categories;
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categoryMap.get(id);
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    
    const category: Category = {
      id,
      ...categoryData,
    };
    
    this.categoryMap.set(id, category);
    return category;
  }
  
  // Implementación de métodos para transacciones
  async getTransactions(userId: number): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    for (const transaction of this.transactionMap.values()) {
      if (transaction.user_id === userId) {
        transactions.push(transaction);
      }
    }
    return transactions;
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactionMap.get(id);
  }
  
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    const transaction: Transaction = {
      id,
      ...transactionData,
    };
    
    this.transactionMap.set(id, transaction);
    return transaction;
  }
  
  // Implementación de métodos para presupuestos
  async getBudgets(userId: number): Promise<Budget[]> {
    const budgets: Budget[] = [];
    for (const budget of this.budgetMap.values()) {
      if (budget.user_id === userId) {
        budgets.push(budget);
      }
    }
    return budgets;
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgetMap.get(id);
  }
  
  async createBudget(budgetData: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    
    const budget: Budget = {
      id,
      ...budgetData,
    };
    
    this.budgetMap.set(id, budget);
    return budget;
  }
  
  // Implementación de métodos para metas financieras
  async getGoals(userId: number): Promise<Goal[]> {
    const goals: Goal[] = [];
    for (const goal of this.goalMap.values()) {
      if (goal.user_id === userId) {
        goals.push(goal);
      }
    }
    return goals;
  }
  
  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goalMap.get(id);
  }
  
  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    
    const goal: Goal = {
      id,
      ...goalData,
    };
    
    this.goalMap.set(id, goal);
    return goal;
  }
  
  async updateGoalProgress(id: number, currentAmount: number): Promise<Goal> {
    const goal = await this.getGoalById(id);
    if (!goal) {
      throw new Error("Meta no encontrada");
    }
    
    const updatedGoal: Goal = {
      ...goal,
      current_amount: currentAmount,
      completed: currentAmount >= goal.target_amount,
    };
    
    this.goalMap.set(id, updatedGoal);
    return updatedGoal;
  }
  
  // Implementación de métodos para deudas y ahorros
  async getDebtsSavings(userId: number): Promise<DebtSaving[]> {
    const debtsSavings: DebtSaving[] = [];
    for (const debtSaving of this.debtSavingMap.values()) {
      if (debtSaving.user_id === userId) {
        debtsSavings.push(debtSaving);
      }
    }
    return debtsSavings;
  }
  
  async getDebtSavingById(id: number): Promise<DebtSaving | undefined> {
    return this.debtSavingMap.get(id);
  }
  
  async createDebtSaving(debtSavingData: InsertDebtSaving): Promise<DebtSaving> {
    const id = this.debtSavingIdCounter++;
    
    const debtSaving: DebtSaving = {
      id,
      ...debtSavingData,
    };
    
    this.debtSavingMap.set(id, debtSaving);
    return debtSaving;
  }
  
  // Implementación de métodos para chat
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    const messages: ChatMessage[] = [];
    for (const message of this.chatMessageMap.values()) {
      if (message.user_id === userId) {
        messages.push(message);
      }
    }
    return messages;
  }
  
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    
    const message: ChatMessage = {
      id,
      ...messageData,
      timestamp: now,
    };
    
    this.chatMessageMap.set(id, message);
    return message;
  }
  
  // Implementación del método para obtener datos del dashboard
  async getDashboardData(userId: number): Promise<any> {
    // Para una primera versión, creamos datos de ejemplo
    // En una versión real, obtendríamos estos datos de las transacciones reales
    
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
        { name: "Vivienda", value: 35 },
        { name: "Alimentación", value: 25 },
        { name: "Transporte", value: 15 },
        { name: "Ocio", value: 10 },
        { name: "Servicios", value: 10 },
        { name: "Otros", value: 5 }
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

export const storage = new MemStorage();
