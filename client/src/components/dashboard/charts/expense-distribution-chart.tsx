import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

interface ExpenseDistributionChartProps {
  data: ExpenseCategory[];
}

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Determine colors based on theme
    const isDark = theme === "dark";
    const borderColor = isDark ? "#1F2937" : "#FFFFFF";

    // Prepare chart data
    const chartData = {
      labels: data.map((item) => item.name),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => {
            const color = item.color;
            return isDark ? color.replace("0.8", "0.7") : color;
          }),
          borderColor,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            titleColor: isDark ? "#F3F4F6" : "#111827",
            bodyColor: isDark ? "#D1D5DB" : "#4B5563",
            borderColor: isDark ? "#374151" : "#E5E7EB",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                return context.label + ": " + context.parsed + "%";
              },
            },
          },
        },
        cutout: "70%",
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
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Distribución de Gastos</CardTitle>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="quarter">Último trimestre</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-60">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {data.map((category) => (
              <div key={category.name} className="flex items-center">
                <span
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color.replace("0.8", "1") }}
                ></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {category.name} ({category.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
