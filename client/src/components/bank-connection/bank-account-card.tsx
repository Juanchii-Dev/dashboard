import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowDownUp,
  CreditCard,
  Download,
  PiggyBank,
  Unlink,
  Wallet,
  BadgeDollarSign,
  Home,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BankAccount, disconnectBankAccount } from "@/lib/bank-connection-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BankAccountCardProps {
  account: BankAccount;
  onViewTransactions?: (accountId: string) => void;
}

export function BankAccountCard({ account, onViewTransactions }: BankAccountCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      setError(null);

      const result = await disconnectBankAccount(account.id);

      if (result.success) {
        toast({
          title: "Cuenta desconectada",
          description: `La cuenta ${account.name} de ${account.bankName} ha sido desconectada correctamente.`,
          duration: 5000,
        });

        // Invalidar queries para recargar los datos
        queryClient.invalidateQueries({ queryKey: ["/api/bank/accounts"] });
        setShowDisconnectDialog(false);
      } else {
        setError(result.message || "Error al desconectar la cuenta. Inténtelo de nuevo más tarde.");
      }
    } catch (error) {
      console.error("Error al desconectar cuenta:", error);
      setError("No se pudo desconectar la cuenta. Inténtelo de nuevo más tarde.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Iconos según el tipo de cuenta
  const getAccountIcon = () => {
    switch (account.type) {
      case "current":
        return <Wallet className="w-5 h-5 text-blue-600" />;
      case "savings":
        return <PiggyBank className="w-5 h-5 text-green-600" />;
      case "investment":
        return <BadgeDollarSign className="w-5 h-5 text-purple-600" />;
      case "credit":
        return <CreditCard className="w-5 h-5 text-red-600" />;
      case "loan":
        return <Home className="w-5 h-5 text-orange-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  // Color según el tipo de cuenta
  const getAccountTypeColor = () => {
    switch (account.type) {
      case "current":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "savings":
        return "bg-green-50 text-green-700 border-green-100";
      case "investment":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "credit":
        return "bg-red-50 text-red-700 border-red-100";
      case "loan":
        return "bg-orange-50 text-orange-700 border-orange-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  // Texto según el tipo de cuenta
  const getAccountTypeText = () => {
    switch (account.type) {
      case "current":
        return "Cuenta Corriente";
      case "savings":
        return "Cuenta de Ahorro";
      case "investment":
        return "Inversión";
      case "credit":
        return "Tarjeta de Crédito";
      case "loan":
        return "Préstamo";
      default:
        return "Cuenta";
    }
  };

  return (
    <>
      <Card className={`transition-all duration-300 hover:shadow-md ${!account.isConnected ? 'opacity-70' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <img src={account.bankLogo} alt={account.bankName} className="w-6 h-6 object-contain" />
                <span>{account.name}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{account.accountNumber}</p>
            </div>
            <Badge variant="outline" className={`text-xs ${getAccountTypeColor()}`}>
              {getAccountTypeText()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 mb-3">
            {getAccountIcon()}
            <div className="space-y-1">
              <p className="text-2xl font-semibold">
                {formatCurrency(account.balance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Actualizado: {formatDate(account.lastUpdated)}
              </p>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={() => onViewTransactions && onViewTransactions(account.id)}
            disabled={!account.isConnected}
          >
            <ArrowDownUp className="w-4 h-4" />
            <span>Transacciones</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5 text-destructive hover:text-destructive"
            onClick={() => setShowDisconnectDialog(true)}
            disabled={!account.isConnected || isDisconnecting}
          >
            <Unlink className="w-4 h-4" />
            <span>Desconectar</span>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Diálogo de confirmación para desconectar */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desconectar cuenta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desconectar la cuenta {account.name} de {account.bankName}?
              <br />
              Puedes volver a conectarla más tarde si lo necesitas.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDisconnectDialog(false)}
              disabled={isDisconnecting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Desconectando..." : "Desconectar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function BankAccountCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3 w-48 mt-2" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}