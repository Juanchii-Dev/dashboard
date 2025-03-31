import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { BankFeature, BankProvider, initiateConnectionWithBank, verifyBankConnection } from "@/lib/bank-connection-service";
import { useQueryClient } from "@tanstack/react-query";

// Mapa de traducciones de características bancarias
const featureLabels: Record<BankFeature, string> = {
  "balance-check": "Consulta de saldo",
  "transactions-history": "Historial de transacciones",
  "auto-categorization": "Categorización automática",
  "real-time-data": "Datos en tiempo real",
  "budget-integration": "Integración con presupuestos",
  "payments": "Pagos",
  "transfer": "Transferencias"
};

interface BankProviderCardProps {
  provider: BankProvider;
  onSuccess?: () => void;
}

export function BankProviderCard({ provider, onSuccess }: BankProviderCardProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      // Iniciar conexión con el banco
      const { connectionId, authUrl } = await initiateConnectionWithBank(provider.id);
      
      // Simular redirección a la página de autorización del banco
      // En un entorno de producción, aquí redirigiríamos al usuario a la URL de autenticación del banco
      toast({
        title: "Conectando con " + provider.name,
        description: "Por favor, complete el proceso de autenticación.",
        duration: 3000
      });
      
      // Simular proceso de autenticación y verificación
      setTimeout(async () => {
        try {
          // Simular código de autorización obtenido después de la autenticación
          const authCode = "auth_" + Date.now();
          
          // Verificar el estado de la conexión
          const result = await verifyBankConnection(connectionId, authCode);
          
          if (result.status === "connected") {
            setConnected(true);
            toast({
              title: "Conexión exitosa",
              description: `Se ha conectado correctamente con ${provider.name}.`,
              duration: 5000
            });
            
            // Invalidar queries para recargar los datos
            queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
            
            // Notificar éxito
            if (onSuccess) {
              onSuccess();
            }
          } else {
            setError(result.message || "Error al conectar con el banco. Inténtelo de nuevo más tarde.");
          }
        } catch (error) {
          console.error("Error en la verificación de la conexión:", error);
          setError("Error al verificar la conexión. Inténtelo de nuevo más tarde.");
        } finally {
          setConnecting(false);
        }
      }, 2000); // Simulamos un retraso para la autenticación
      
    } catch (error) {
      console.error("Error al iniciar conexión con banco:", error);
      setError("No se pudo iniciar la conexión con el banco. Inténtelo de nuevo más tarde.");
      setConnecting(false);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <img 
                src={provider.logo} 
                alt={provider.name} 
                className="w-8 h-8 object-contain"
              />
              <span>{provider.name}</span>
            </CardTitle>
          </div>
          {connected && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
              <CheckCircle className="w-3 h-3" />
              <span>Conectado</span>
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{provider.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1.5">
          {provider.availableFeatures.map((feature) => (
            <Badge 
              key={feature} 
              variant="secondary" 
              className="text-xs py-0.5 bg-gray-100 text-gray-700"
            >
              {featureLabels[feature] || feature}
            </Badge>
          ))}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleConnect} 
          disabled={connecting || connected}
          className="w-full flex items-center gap-2"
          variant={connected ? "outline" : "default"}
        >
          {!connected && <PlusCircle className="w-4 h-4" />}
          {connecting 
            ? "Conectando..." 
            : connected 
              ? "Conectado" 
              : "Conectar"
          }
        </Button>
      </CardFooter>
    </Card>
  );
}