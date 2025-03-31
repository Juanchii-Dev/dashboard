import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email").unique(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de categorías
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "income" o "expense"
  icon: text("icon"),
  color: text("color"),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

// Tabla de transacciones
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  category_id: integer("category_id").references(() => categories.id),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

// Tabla de presupuestos
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // "monthly", "quarterly", "yearly"
  category_id: integer("category_id").references(() => categories.id),
  user_id: integer("user_id").references(() => users.id).notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  active: boolean("active").default(true),
});

// Tabla de metas financieras
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  target_amount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  current_amount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  target_date: timestamp("target_date"),
  description: text("description"),
  category: text("category").notNull(), // "savings", "debt_payoff", "purchase", etc.
  user_id: integer("user_id").references(() => users.id).notNull(),
  completed: boolean("completed").default(false),
});

// Tabla de deudas y ahorros
export const debts_savings = pgTable("debts_savings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "debt" o "saving"
  category: text("category").notNull(), // "credit_card", "mortgage", "savings_account", etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interest_rate: decimal("interest_rate", { precision: 5, scale: 2 }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  payment_amount: decimal("payment_amount", { precision: 10, scale: 2 }),
  payment_frequency: text("payment_frequency"), // "monthly", "quarterly", "yearly"
  user_id: integer("user_id").references(() => users.id).notNull(),
  active: boolean("active").default(true),
});

// Tabla para mensajes de chat
export const chat_messages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // "user" o "bot"
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  user_id: integer("user_id").references(() => users.id).notNull(),
});

// Esquemas para inserción
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  type: true,
  icon: true,
  color: true,
  user_id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  description: true,
  amount: true,
  date: true,
  category_id: true,
  user_id: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  name: true,
  amount: true,
  period: true,
  category_id: true,
  user_id: true,
  start_date: true,
  end_date: true,
  active: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  target_amount: true,
  current_amount: true,
  target_date: true,
  description: true,
  category: true,
  user_id: true,
  completed: true,
});

export const insertDebtSavingSchema = createInsertSchema(debts_savings).pick({
  name: true,
  type: true,
  category: true,
  amount: true,
  interest_rate: true,
  start_date: true,
  end_date: true,
  payment_amount: true,
  payment_frequency: true,
  user_id: true,
  active: true,
});

export const insertChatMessageSchema = createInsertSchema(chat_messages).pick({
  content: true,
  role: true,
  user_id: true,
});

// Tipos para la aplicación
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type DebtSaving = typeof debts_savings.$inferSelect;
export type InsertDebtSaving = z.infer<typeof insertDebtSavingSchema>;

export type ChatMessage = typeof chat_messages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
