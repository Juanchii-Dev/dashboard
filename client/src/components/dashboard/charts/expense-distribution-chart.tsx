import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/theme-context";
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from "chart.js";
import { ExpenseCategory } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Eye } from "lucide-react";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface ExpenseDistributionChartProps {
  data: ExpenseCategory[];
}

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("month");
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          hoverOffset: 8,
          hoverBorderWidth: 4,
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
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
            displayColors: true,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return context.label + ": " + context.parsed + "%";
              },
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              afterLabel: function(tooltipItem) {
                const dataset = tooltipItem.dataset;
                const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                const currentValue = dataset.data[tooltipItem.dataIndex] as number;
                const percentage = (currentValue / total * 100).toFixed(1);
                return `Representa el ${percentage}% del total`;
              }
            },
          },
        },
        cutout: "70%",
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            setSelectedSegment(selectedSegment === index ? null : index);
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme, timeRange, selectedSegment]);

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
    // In a real app, you would fetch new data based on the time range
  };
  
  const handleZoomIn = () => {
    if (chartInstance.current && selectedSegment !== null) {
      // En un caso real, aquí podrías cargar datos más detallados para la categoría seleccionada
      alert(`Mostrando desglose detallado de: ${data[selectedSegment].name}`);
    }
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simular recarga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Distribución de Gastos
          {isLoading && <span className="ml-2 inline-block w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></span>}
        </CardTitle>
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
              onClick={handleZoomIn}
              disabled={selectedSegment === null}
              title="Ver detalles de la categoría seleccionada"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className={`h-60 relative transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <canvas ref={chartRef}></canvas>
          {selectedSegment !== null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 rounded-full p-2 animate-pulse">
                <p className="text-xs font-medium">{data[selectedSegment].name} seleccionado</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {data.map((category, index) => (
              <div 
                key={category.name} 
                className={`flex items-center p-1 rounded-md cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedSegment === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
              >
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
        {selectedSegment !== null && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h4 className="text-sm font-medium mb-1">Detalles de {data[selectedSegment].name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Haz clic en "Ver detalles" para un análisis detallado de esta categoría</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
