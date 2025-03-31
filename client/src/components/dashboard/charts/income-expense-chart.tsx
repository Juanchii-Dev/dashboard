import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import { formatCurrency } from "@/lib/formatters";
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend);

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

  // Calculate totals
  const totalIncome = data.income.reduce((acc, cur) => acc + cur, 0);
  const totalExpenses = data.expenses.reduce((acc, cur) => acc + cur, 0);

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

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Ingresos",
            backgroundColor: incomeColor,
            borderColor: incomeBorderColor,
            borderWidth: 1,
            data: data.income,
          },
          {
            label: "Gastos",
            backgroundColor: expenseColor,
            borderColor: expenseBorderColor,
            borderWidth: 1,
            data: data.expenses,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: textColor,
            },
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
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme, timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // In a real app, you would fetch new data based on the time range
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Ingresos vs. Gastos</CardTitle>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="1year">Último año</SelectItem>
            <SelectItem value="3years">Últimos 3 años</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-60">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 px-6 py-3">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos acumulados</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos acumulados</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
