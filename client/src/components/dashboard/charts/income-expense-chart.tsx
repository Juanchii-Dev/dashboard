import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, RotateCw, Maximize2, Download } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { 
  Chart, CategoryScale, LinearScale, BarController, BarElement, 
  LineController, LineElement, PointElement, Tooltip, Legend,
  ChartTypeRegistry
} from "chart.js";

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarController, 
  BarElement, 
  LineController, 
  LineElement, 
  PointElement, 
  Tooltip, 
  Legend
);

interface IncomeExpenseChartProps {
  data: {
    labels: string[];
    income: number[];
    expenses: number[];
  };
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("6months");
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Calculate totals
  const totalIncome = data.income.reduce((acc, cur) => acc + cur, 0);
  const totalExpenses = data.expenses.reduce((acc, cur) => acc + cur, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Calculate difference percentages for each month
  const differences = data.labels.map((_, index) => {
    const income = data.income[index];
    const expense = data.expenses[index];
    return income > 0 ? ((income - expense) / income) * 100 : 0;
  });

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Determine colors based on theme
    const isDark = theme === "dark";
    const textColor = isDark ? "#D1D5DB" : "#4B5563";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const incomeColor = isDark ? "rgba(74, 222, 128, 0.6)" : "rgba(34, 197, 94, 0.6)";
    const incomeBorderColor = isDark ? "rgb(74, 222, 128)" : "rgb(34, 197, 94)";
    const expenseColor = isDark ? "rgba(248, 113, 113, 0.6)" : "rgba(239, 68, 68, 0.6)";
    const expenseBorderColor = isDark ? "rgb(248, 113, 113)" : "rgb(239, 68, 68)";
    const savingsColor = isDark ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.6)";
    const savingsBorderColor = isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)";

    // Calculate net savings for each period
    const savings = data.income.map((income, index) => income - data.expenses[index]);

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare datasets
    const datasets = [
      {
        label: "Ingresos",
        backgroundColor: incomeColor,
        borderColor: incomeBorderColor,
        borderWidth: 1,
        data: data.income,
        order: 2
      },
      {
        label: "Gastos",
        backgroundColor: expenseColor,
        borderColor: expenseBorderColor,
        borderWidth: 1,
        data: data.expenses,
        order: 3
      }
    ];

    // Add savings dataset if comparison is enabled
    if (showComparison) {
      datasets.push({
        label: "Ahorro Neto",
        backgroundColor: savingsColor,
        borderColor: savingsBorderColor,
        borderWidth: 2,
        data: savings,
        // Necesitamos usar la función tipo cast para TypeScript
        type: 'line' as keyof ChartTypeRegistry,
        order: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false
      } as any); // Usamos any aquí para evitar errores de TypeScript
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: data.labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15
            },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              
              if (ci.isDatasetVisible(index)) {
                ci.hide(index);
                legendItem.hidden = true;
              } else {
                ci.show(index);
                legendItem.hidden = false;
              }
              ci.update();
            }
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            titleColor: isDark ? "#F3F4F6" : "#111827",
            bodyColor: isDark ? "#D1D5DB" : "#4B5563",
            borderColor: isDark ? "#374151" : "#E5E7EB",
            borderWidth: 1,
            padding: 10,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return context.dataset.label + ": " + formatCurrency(context.raw as number);
              },
              afterBody: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex;
                const income = data.income[index];
                const expense = data.expenses[index];
                const saving = income - expense;
                const rate = income > 0 ? (saving / income) * 100 : 0;
                
                return [
                  `Ahorro: ${formatCurrency(saving)}`,
                  `Tasa de ahorro: ${formatPercentage(rate)}`
                ];
              }
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
            },
            grid: {
              color: gridColor,
              display: chartType === 'bar' ? false : true,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor,
              callback: function (value) {
                return formatCurrency(value as number);
              },
            },
            grid: {
              color: gridColor,
            },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            setActiveIndex(activeIndex === index ? null : index);
          }
        }
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme, timeRange, chartType, showComparison, activeIndex]);

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
    // In a real app, you would fetch new data based on the time range
  };
  
  const toggleChartType = () => {
    setChartType(chartType === "bar" ? "line" : "bar");
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simular recarga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  const toggleComparison = () => {
    setShowComparison(!showComparison);
  };
  
  const exportChartData = () => {
    // Crear un objeto con los datos del gráfico
    const chartData = {
      labels: data.labels,
      income: data.income,
      expenses: data.expenses,
      savings: data.income.map((income, index) => income - data.expenses[index]),
      savingsRates: differences,
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        netSavings: netSavings,
        savingsRate: savingsRate
      }
    };
    
    // Convertir a JSON
    const jsonData = JSON.stringify(chartData, null, 2);
    
    // Crear blob y enlace de descarga
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Crear enlace y simular clic
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos-gastos-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ingresos vs. Gastos</CardTitle>
          {isLoading && <span className="ml-2 inline-block w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              title="Actualizar datos"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={toggleChartType}
              title={`Cambiar a ${chartType === 'bar' ? 'líneas' : 'barras'}`}
            >
              {chartType === 'bar' ? <LineChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-8 w-8 ${showComparison ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onClick={toggleComparison}
              title="Mostrar/ocultar línea de ahorro"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={exportChartData}
              title="Exportar datos"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
              <SelectItem value="3years">Últimos 3 años</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className={`h-60 relative transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <canvas ref={chartRef}></canvas>
          {activeIndex !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 rounded-full p-2 animate-pulse">
                <p className="text-xs font-medium">Mes seleccionado: {data.labels[activeIndex]}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700 px-6 py-3">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos acumulados</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos acumulados</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ahorro neto</p>
          <p className={`text-lg font-semibold ${netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(netSavings)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de ahorro</p>
          <p className={`text-lg font-semibold ${savingsRate >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPercentage(savingsRate)}
          </p>
        </div>
        {activeIndex !== null && (
          <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-md">
            <h4 className="text-sm font-medium mb-1">Datos de {data.labels[activeIndex]}</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Ingresos:</span>{" "}
                <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(data.income[activeIndex])}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Gastos:</span>{" "}
                <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(data.expenses[activeIndex])}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tasa de ahorro:</span>{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">{formatPercentage(differences[activeIndex])}</span>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
