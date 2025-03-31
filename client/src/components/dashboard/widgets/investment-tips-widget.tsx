import { useState, useEffect } from "react";
import { TrendingUp, ExternalLink, BookOpen, Filter, BarChart4 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InvestmentTip {
  id: string;
  title: string;
  description: string;
  category: "fondos" | "acciones" | "etf" | "criptomonedas" | "general";
  riskLevel: "bajo" | "medio" | "alto";
  source?: string;
  url?: string;
}

export function InvestmentTipsWidget() {
  const [tips, setTips] = useState<InvestmentTip[]>([]);
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Cargar consejos de inversión al montar el componente
  useEffect(() => {
    loadTips();
  }, []);

  // Función para cargar consejos de inversión
  const loadTips = async () => {
    setIsLoading(true);
    
    try {
      // En una aplicación real, esto vendría de una API o servicio especializado
      // Para el demo, mostramos consejos educativos básicos
      const demoTips: InvestmentTip[] = [
        {
          id: "1",
          title: "Diversifica tu cartera",
          description: "La diversificación es clave para reducir el riesgo. Distribuye tus inversiones en diferentes activos y sectores.",
          category: "general",
          riskLevel: "bajo",
          source: "Investopedia"
        },
        {
          id: "2",
          title: "Fondos indexados para principiantes",
          description: "Los fondos indexados ofrecen una forma sencilla de invertir en el mercado con bajas comisiones y buena diversificación.",
          category: "fondos",
          riskLevel: "bajo",
          source: "CNMV",
          url: "https://www.cnmv.es"
        },
        {
          id: "3",
          title: "ETFs sectoriales para exposición específica",
          description: "Considera ETFs específicos de sectores con buenas perspectivas como tecnología, energías renovables o salud.",
          category: "etf",
          riskLevel: "medio"
        },
        {
          id: "4",
          title: "Invest regularly with dollar-cost averaging",
          description: "Invierte regularmente la misma cantidad, independientemente del precio del mercado, para reducir el impacto de la volatilidad.",
          category: "general",
          riskLevel: "bajo",
          source: "Banco de España"
        },
        {
          id: "5",
          title: "Cuidado con invertir en criptomonedas",
          description: "Las criptomonedas son altamente volátiles. No inviertas más de lo que estés dispuesto a perder.",
          category: "criptomonedas",
          riskLevel: "alto",
          source: "CNMV",
          url: "https://www.cnmv.es/portal/Inversor/Criptoactivos.aspx"
        }
      ];
      
      setTips(demoTips);
    } catch (error) {
      console.error("Error loading investment tips:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los consejos de inversión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar consejos por categoría
  const filteredTips = activeTab === "todos" 
    ? tips 
    : tips.filter(tip => tip.category === activeTab);

  // Obtener color según nivel de riesgo
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "bajo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "alto":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Función para generar consejos personalizados usando OpenAI en un escenario real
  const requestPersonalizedTips = async () => {
    toast({
      title: "Personalizando consejos",
      description: "Estamos analizando tu perfil financiero para ofrecerte consejos más relevantes.",
    });
    
    // En una implementación real, esto usaría la API de OpenAI para generar consejos personalizados
    // basados en el perfil del usuario, sus objetivos y su historial financiero
    
    setTimeout(() => {
      toast({
        title: "Consejos actualizados",
        description: "Hemos personalizado los consejos según tu perfil de inversión.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">Consejos de inversión</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={requestPersonalizedTips}
          >
            <Filter className="h-4 w-4 mr-1" /> Personalizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="fondos" className="text-xs">Fondos</TabsTrigger>
          <TabsTrigger value="etf" className="text-xs">ETFs</TabsTrigger>
          <TabsTrigger value="acciones" className="text-xs">Acciones</TabsTrigger>
          <TabsTrigger value="criptomonedas" className="text-xs">Cripto</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay consejos disponibles en esta categoría.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTips.map(tip => (
                <Card key={tip.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{tip.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn("ml-2", getRiskBadgeColor(tip.riskLevel))}
                        >
                          Riesgo: {tip.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          {tip.source && (
                            <span className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" /> 
                              Fuente: {tip.source}
                            </span>
                          )}
                        </div>
                        {tip.url && (
                          <Button variant="link" size="sm" className="h-6 p-0" asChild>
                            <a href={tip.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" /> 
                              Más info
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-2">
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.cnmv.es/portal/inversor/Guias-Inversionista.aspx" target="_blank" rel="noopener noreferrer">
            <BarChart4 className="h-4 w-4 mr-2" /> 
            Acceder a guías de inversión
          </a>
        </Button>
      </div>
    </div>
  );
}