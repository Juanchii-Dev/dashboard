import { Widget, WidgetType } from "@/context/widget-context";
import { SavingsSuggestionsWidget } from "./widgets/savings-suggestions-widget";
import { InvestmentTipsWidget } from "./widgets/investment-tips-widget";
import { AlertCircle, Calendar, LineChart, PiggyBank, CreditCard, TrendingUp, Wallet, BarChart, Users, DollarSign } from "lucide-react";
import { WidgetContainer } from "./widget-container";
import { BudgetItem } from "./budget-item";
import { TransactionItem } from "./transaction-item";
import { FinancialGoal } from "./financial-goal";
import { FinancialCard } from "./financial-card";
import { formatCurrency } from "@/lib/formatters";

// Importar componentes necesarios
interface WidgetRendererProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: Widget["size"]) => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
}

export function WidgetRenderer({ widget, onRemove, onSizeChange, isDraggable, dragHandleProps }: WidgetRendererProps) {
  // Función para renderizar el contenido del widget según su tipo
  const renderWidgetContent = (type: WidgetType) => {
    switch (type) {
      case "balance":
        return (
          <div className="flex flex-col space-y-4">
            <FinancialCard
              title="Balance General"
              amount={5230.45}
              icon={Wallet}
              iconColor="text-white"
              iconBgColor="bg-blue-500"
              footerText="Actualizado: Hoy"
            />
          </div>
        );
      
      case "income-expense":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FinancialCard
                title="Ingresos Mensuales"
                amount={2500}
                icon={TrendingUp}
                iconColor="text-white"
                iconBgColor="bg-green-500"
              />
              <FinancialCard
                title="Gastos Mensuales"
                amount={1850.30}
                icon={TrendingUp}
                iconColor="text-white"
                iconBgColor="bg-red-500"
              />
            </div>
            <div className="h-60 flex items-center justify-center border rounded-md bg-muted/40">
              <p className="text-muted-foreground">Gráfico de Ingresos vs Gastos</p>
            </div>
          </div>
        );
      
      case "expense-distribution":
        return (
          <div className="space-y-4">
            <div className="h-60 flex items-center justify-center border rounded-md bg-muted/40">
              <p className="text-muted-foreground">Gráfico circular de gastos por categoría</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Vivienda (35%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Alimentación (25%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Transporte (15%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">Entretenimiento (10%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-sm">Salud (8%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm">Otros (7%)</span>
              </div>
            </div>
          </div>
        );
      
      case "recent-transactions":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Últimas Transacciones</h3>
              <button className="text-sm text-primary hover:underline">Ver todas</button>
            </div>
            <div className="space-y-3">
              <TransactionItem
                title="Supermercado Mercadona"
                date="2025-03-30"
                amount={85.32}
                type="expense"
                icon={ShoppingBag}
              />
              <TransactionItem
                title="Transferencia Recibida"
                date="2025-03-28"
                amount={750.00}
                type="income"
                icon={ArrowDownLeft}
              />
              <TransactionItem
                title="Pago de Netflix"
                date="2025-03-27"
                amount={12.99}
                type="expense"
                icon={FilmIcon}
              />
              <TransactionItem
                title="Restaurante El Celler"
                date="2025-03-25"
                amount={52.80}
                type="expense"
                icon={UtensilsIcon}
              />
              <TransactionItem
                title="Pago Factura Luz"
                date="2025-03-22"
                amount={87.45}
                type="expense"
                icon={Zap}
              />
            </div>
          </div>
        );
      
      case "budgets":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Presupuestos Mensuales</h3>
              <button className="text-sm text-primary hover:underline">Gestionar</button>
            </div>
            <div className="space-y-4">
              <BudgetItem
                name="Alimentación"
                spent={350}
                limit={500}
              />
              <BudgetItem
                name="Entretenimiento"
                spent={180}
                limit={150}
              />
              <BudgetItem
                name="Transporte"
                spent={120}
                limit={200}
              />
              <BudgetItem
                name="Otros gastos"
                spent={250}
                limit={400}
              />
            </div>
          </div>
        );
      
      case "goals":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Metas Financieras</h3>
              <button className="text-sm text-primary hover:underline">Ver todas</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FinancialGoal
                title="Viaje a Japón"
                current={1200}
                target={4000}
                icon={Plane}
                iconColor="text-white"
                iconBgColor="bg-blue-500"
              />
              <FinancialGoal
                title="Fondo de emergencia"
                current={3500}
                target={6000}
                icon={Shield}
                iconColor="text-white"
                iconBgColor="bg-red-500"
              />
              <FinancialGoal
                title="Entrada piso"
                current={15000}
                target={50000}
                icon={Home}
                iconColor="text-white"
                iconBgColor="bg-green-500"
              />
            </div>
          </div>
        );
      
      case "debt-savings":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Deudas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span>Préstamo Coche</span>
                    <span className="font-medium">{formatCurrency(8500)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span>Tarjeta de Crédito</span>
                    <span className="font-medium">{formatCurrency(1200)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Ahorros</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span>Cuenta de Ahorros</span>
                    <span className="font-medium">{formatCurrency(12500)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                    <span>Plan de Pensiones</span>
                    <span className="font-medium">{formatCurrency(28000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "calendar":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Calendario Financiero</h3>
            <div className="h-48 flex items-center justify-center border rounded-md bg-muted/40">
              <p className="text-muted-foreground">Calendario con próximos pagos y cobros</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  <span>Hipoteca</span>
                </div>
                <span>5 Abril</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span>Nómina</span>
                </div>
                <span>30 Abril</span>
              </div>
            </div>
          </div>
        );
      
      case "financial-health":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Salud Financiera</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg className="w-32 h-32">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    strokeDasharray="352"
                    strokeDashoffset="88"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">75%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ratio de Ahorro</span>
                <span className="text-sm font-medium">Bueno</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ratio de Deuda</span>
                <span className="text-sm font-medium">Excelente</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fondo de Emergencia</span>
                <span className="text-sm font-medium">Mejorable</span>
              </div>
            </div>
          </div>
        );
      
      case "savings-suggestions":
        return <SavingsSuggestionsWidget />;
      
      case "investment-tips":
        return <InvestmentTipsWidget />;
      
      default:
        return (
          <div className="h-32 flex items-center justify-center">
            <p className="text-muted-foreground">Widget no disponible</p>
          </div>
        );
    }
  };

  return (
    <WidgetContainer 
      widget={widget}
      onRemove={onRemove}
      onSizeChange={onSizeChange}
      isDraggable={isDraggable}
      dragHandleProps={dragHandleProps}
    >
      {renderWidgetContent(widget.type)}
    </WidgetContainer>
  );
}

// Importaciones de iconos para las transacciones
import { ShoppingBag, ArrowDownLeft, Zap, Plane, Shield, Home } from "lucide-react";
import { FilmIcon, UtensilsIcon } from "lucide-react";