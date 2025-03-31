import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RefreshCw,
  Wallet 
} from "lucide-react";
import { 
  BankAccount, 
  BankConnectionStatus, 
  BankProvider, 
  getAvailableBankProviders, 
  getBankAccounts, 
  synchronizeBankData 
} from "@/lib/bank-connection-service";
import { BankProviderCard } from "./bank-provider-card";
import { BankAccountCard, BankAccountCardSkeleton } from "./bank-account-card";
import { useToast } from "@/hooks/use-toast";

// Componente para iconos SVG que no están en lucide-react
function ArrowPathIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

export function BankConnectionsSection() {
  const [activeTab, setActiveTab] = useState("connected");
  const [syncingData, setSyncingData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status?: BankConnectionStatus;
    message?: string;
  }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta de proveedores bancarios disponibles
  const providersQuery = useQuery({
    queryKey: ["/api/bank/providers"],
    queryFn: getAvailableBankProviders
  });

  // Consulta de cuentas bancarias conectadas
  const accountsQuery = useQuery({
    queryKey: ["/api/bank/accounts"],
    queryFn: getBankAccounts
  });

  // Filtrar cuentas conectadas y desconectadas
  const connectedAccounts = accountsQuery.data?.filter(acc => acc.isConnected) || [];
  const disconnectedAccounts = accountsQuery.data?.filter(acc => !acc.isConnected) || [];

  // Manejar la sincronización de datos bancarios
  const handleSyncData = async () => {
    try {
      setSyncingData(true);
      setConnectionStatus({});

      const result = await synchronizeBankData();

      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: result.message,
          duration: 5000
        });

        // Actualizar datos
        queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
      } else {
        toast({
          title: "Error de sincronización",
          description: result.message || "No se pudieron sincronizar los datos. Inténtelo de nuevo más tarde.",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error al sincronizar datos bancarios:", error);
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error al sincronizar los datos bancarios. Inténtelo de nuevo más tarde.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setSyncingData(false);
    }
  };

  // Manejar la visualización de transacciones
  const handleViewTransactions = (accountId: string) => {
    // Esta función puede navegar a una página de transacciones o abrir un modal
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La visualización de transacciones estará disponible próximamente.",
      duration: 3000
    });
  };

  // Cuando un proveedor ha sido conectado exitosamente
  const handleConnectionSuccess = () => {
    setConnectionStatus({
      status: "connected",
      message: "Cuenta conectada exitosamente. Puede acceder a sus datos bancarios en la pestaña 'Conectadas'."
    });
    
    // Cambiar a la pestaña de cuentas conectadas
    setActiveTab("connected");
    
    // Refrescar los datos de las cuentas
    queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
    
    toast({
      title: "Conexión exitosa",
      description: "Conexión bancaria establecida correctamente.",
      duration: 5000
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Conexiones Bancarias</h2>
          <p className="text-muted-foreground">
            Conecta tus cuentas bancarias para gestionar tus finanzas en un solo lugar.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleSyncData}
          disabled={syncingData || !connectedAccounts.length}
        >
          <RefreshCw className={`w-4 h-4 ${syncingData ? 'animate-spin' : ''}`} />
          {syncingData ? "Sincronizando..." : "Sincronizar datos"}
        </Button>
      </div>

      {connectionStatus.status && (
        <Alert 
          variant={connectionStatus.status === "error" ? "destructive" : "default"}
          className={connectionStatus.status === "connected" ? "bg-green-50 text-green-800 border-green-200" : ""}
        >
          {connectionStatus.status === "connected" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {connectionStatus.status === "connected" 
              ? "Conexión establecida" 
              : "Error de conexión"
            }
          </AlertTitle>
          <AlertDescription>
            {connectionStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="connected" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="connected" className="relative">
            Conectadas
            {connectedAccounts.length > 0 && (
              <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                {connectedAccounts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available">
            Disponibles
            {providersQuery.data?.length && providersQuery.data.length > 0 && (
              <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                {providersQuery.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="mt-4">
          {accountsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <BankAccountCardSkeleton key={i} />
              ))}
            </div>
          ) : connectedAccounts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedAccounts.map((account) => (
                  <BankAccountCard 
                    key={account.id} 
                    account={account}
                    onViewTransactions={handleViewTransactions}
                  />
                ))}
              </div>
              
              {disconnectedAccounts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-3">Cuentas Desconectadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disconnectedAccounts.map((account) => (
                      <BankAccountCard 
                        key={account.id} 
                        account={account}
                        onViewTransactions={handleViewTransactions}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay cuentas conectadas</h3>
              <p className="text-muted-foreground text-center mt-1 mb-4 max-w-md">
                Conecta tus cuentas bancarias para comenzar a gestionar tus finanzas en un solo lugar.
              </p>
              <Button
                variant="outline"
                onClick={() => setActiveTab("available")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Conectar banco
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          {providersQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : providersQuery.data && providersQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providersQuery.data.map((provider: BankProvider) => (
                <BankProviderCard 
                  key={provider.id} 
                  provider={provider}
                  onSuccess={handleConnectionSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay proveedores disponibles</h3>
              <p className="text-muted-foreground text-center mt-1 max-w-md">
                No se pudieron cargar los proveedores bancarios disponibles. Inténtelo de nuevo más tarde.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}