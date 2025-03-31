import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación para transacciones
const transactionSchema = z.object({
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
    message: "El monto debe ser un número válido y no puede ser cero",
  }),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  date: z.string().min(1, "Debe seleccionar una fecha"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionForm({ isOpen, onClose }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const { toast } = useToast();
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: TransactionFormData) {
    setIsSubmitting(true);
    
    try {
      // Convertir monto a formato positivo/negativo según el tipo
      const amount = transactionType === "income" 
        ? Math.abs(Number(data.amount)) 
        : -Math.abs(Number(data.amount));
      
      const transaction = {
        description: data.description,
        amount: amount,
        category_id: parseInt(data.category), // En una implementación real, este sería el ID real
        date: new Date(data.date),
      };
      
      // Enviar datos al servidor
      await apiRequest("POST", "/api/transactions", transaction);
      
      // Actualizar cache de react-query
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: "Transacción creada",
        description: "La transacción ha sido registrada con éxito.",
      });
      
      // Cerrar modal y resetear formulario
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la transacción. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = transactionType === "income" 
    ? CATEGORIES.INCOME 
    : CATEGORIES.EXPENSE;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir nueva transacción</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="flex space-x-4 mb-6">
            <Button
              type="button"
              variant={transactionType === "expense" ? "destructive" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("expense")}
            >
              Gasto
            </Button>
            <Button
              type="button"
              variant={transactionType === "income" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTransactionType("income")}
            >
              Ingreso
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...form.register("description")}
                placeholder="Ej: Compra supermercado"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (€)</Label>
              <Input
                id="amount"
                {...form.register("amount")}
                placeholder="Ej: 125.50"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}