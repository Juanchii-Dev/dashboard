import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialCard } from "@/components/dashboard/financial-card";
import { BudgetItem } from "@/components/dashboard/budget-item";
import { FinancialGoal } from "@/components/dashboard/financial-goal";
import { TransactionItem } from "@/components/dashboard/transaction-item";
import { IncomeExpenseChart } from "@/components/dashboard/charts/income-expense-chart";
import { ExpenseDistributionChart } from "@/components/dashboard/charts/expense-distribution-chart";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BudgetForm } from "@/components/forms/budget-form";
import { GoalForm } from "@/components/forms/goal-form";
import { getDashboardData } from "@/lib/chat-service";
import { 
  Wallet, 
  ArrowDown, 
  ArrowUp, 
  PiggyBank, 
  Settings, 
  RefreshCcw,
  Plane,
  Car,
  GraduationCap,
  ShoppingCart,
  Building,
  Utensils,
  Smartphone,
  Fuel,
  Plus
} from "lucide-react";
import { DashboardData, ExpenseCategory } from "@/types/finance";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Income expense chart data
  const incomeExpenseData = {
    labels: ["Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre"],
    income: [3800, 4100, 3950, 4300, 4200, 4500],
    expenses: [2900, 3200, 2800, 3100, 2950, 2850],
  };

  // Expense distribution data
  const expenseDistributionData: ExpenseCategory[] = [
    { name: "Vivienda", value: 35, color: "rgba(59, 130, 246, 0.8)" },
    { name: "Alimentación", value: 25, color: "rgba(34, 197, 94, 0.8)" },
    { name: "Transporte", value: 15, color: "rgba(245, 158, 11, 0.8)" },
    { name: "Ocio", value: 10, color: "rgba(124, 58, 237, 0.8)" },
    { name: "Servicios", value: 10, color: "rgba(236, 72, 153, 0.8)" },
    { name: "Otros", value: 5, color: "rgba(107, 114, 128, 0.8)" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="lg:flex lg:items-center lg:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 font-montserrat text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                Panel Principal
              </h2>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <span className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
                >
                  <Settings className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  Personalizar panel
                </Button>
              </span>
              <span className="ml-3 hidden sm:block">
                <Button
                  size="sm"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Actualizar datos
                </Button>
              </span>
            </div>
          </div>

          {/* Financial summary cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FinancialCard
              title="Balance total"
              amount={15300}
              icon={Wallet}
              iconColor="text-primary-600 dark:text-primary-400"
              iconBgColor="bg-primary-500/10 dark:bg-primary-500/20"
            />
            <FinancialCard
              title="Ingresos (este mes)"
              amount={4500}
              icon={ArrowDown}
              iconColor="text-green-600 dark:text-green-400"
              iconBgColor="bg-green-500/10 dark:bg-green-500/20"
            />
            <FinancialCard
              title="Gastos (este mes)"
              amount={2850}
              icon={ArrowUp}
              iconColor="text-red-600 dark:text-red-400"
              iconBgColor="bg-red-500/10 dark:bg-red-500/20"
            />
            <FinancialCard
              title="Ahorro (este mes)"
              amount={1650}
              icon={PiggyBank}
              iconColor="text-yellow-600 dark:text-yellow-400"
              iconBgColor="bg-yellow-500/10 dark:bg-yellow-500/20"
            />
          </div>

          {/* Charts and data widgets */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <IncomeExpenseChart data={incomeExpenseData} />
            <ExpenseDistributionChart data={expenseDistributionData} />
          </div>

          {/* Bottom section: Budgets, Goals, Transactions */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Presupuestos */}
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Presupuestos</h3>
                  <a
                    href="/presupuestos"
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    Ver todos
                  </a>
                </div>
                <div className="mt-5 space-y-6">
                  <BudgetItem name="Alimentación" spent={450} limit={600} />
                  <BudgetItem name="Transporte" spent={320} limit={300} />
                  <BudgetItem name="Ocio" spent={170} limit={250} />
                  <BudgetItem name="Servicios" spent={220} limit={200} />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <Button className="w-full" onClick={() => setIsBudgetFormOpen(true)}>Crear nuevo presupuesto</Button>
              </CardFooter>
            </Card>

            {/* Metas financieras */}
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metas financieras</h3>
                  <a
                    href="/metas"
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    Ver todas
                  </a>
                </div>
                <div className="mt-5 space-y-5">
                  <FinancialGoal
                    title="Vacaciones"
                    current={1500}
                    target={2500}
                    icon={Plane}
                    iconColor="text-yellow-600 dark:text-yellow-400"
                    iconBgColor="bg-yellow-500/10 dark:bg-yellow-500/20"
                  />
                  <FinancialGoal
                    title="Nuevo coche"
                    current={3200}
                    target={15000}
                    icon={Car}
                    iconColor="text-primary-600 dark:text-primary-400"
                    iconBgColor="bg-primary-500/10 dark:bg-primary-500/20"
                  />
                  <FinancialGoal
                    title="Curso de formación"
                    current={800}
                    target={1200}
                    icon={GraduationCap}
                    iconColor="text-teal-600 dark:text-teal-400"
                    iconBgColor="bg-teal-500/10 dark:bg-teal-500/20"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <Button className="w-full" onClick={() => setIsGoalFormOpen(true)}>Añadir nueva meta</Button>
              </CardFooter>
            </Card>

            {/* Últimas transacciones */}
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Últimas transacciones</h3>
                  <a
                    href="/transacciones"
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                  >
                    Ver todas
                  </a>
                </div>
                <div className="mt-5 space-y-3">
                  <TransactionItem
                    title="Supermercado El Corte"
                    date={new Date()}
                    amount={85.2}
                    type="expense"
                    icon={ShoppingCart}
                  />
                  <TransactionItem
                    title="Nómina Empresa S.L."
                    date={new Date(Date.now() - 86400000)} // yesterday
                    amount={1500}
                    type="income"
                    icon={Building}
                  />
                  <TransactionItem
                    title="Restaurante La Mesa"
                    date="2023-10-21T21:45:00"
                    amount={56.8}
                    type="expense"
                    icon={Utensils}
                  />
                  <TransactionItem
                    title="Factura Telefónica"
                    date="2023-10-20T08:00:00"
                    amount={42.99}
                    type="expense"
                    icon={Smartphone}
                  />
                  <TransactionItem
                    title="Gasolinera Repsol"
                    date="2023-10-19T17:25:00"
                    amount={70.15}
                    type="expense"
                    icon={Fuel}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                <Button className="w-full" onClick={() => setIsTransactionFormOpen(true)}>Registrar transacción</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Formularios modales */}
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onClose={() => setIsTransactionFormOpen(false)} 
      />
      <BudgetForm 
        isOpen={isBudgetFormOpen} 
        onClose={() => setIsBudgetFormOpen(false)} 
      />
      <GoalForm 
        isOpen={isGoalFormOpen} 
        onClose={() => setIsGoalFormOpen(false)} 
      />
    </>
  );
}