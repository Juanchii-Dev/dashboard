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
import { DEBT_TYPES, SAVINGS_TYPES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación para deudas y ahorros
const debtSavingSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El monto debe ser un número válido y mayor que cero",
  }),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  interestRate: z.string().optional(),
  dueDate: z.string().optional(),
});

type DebtSavingFormData = z.infer<typeof debtSavingSchema>;

interface DebtSavingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebtSavingForm({ isOpen, onClose }: DebtSavingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState<"debt" | "saving">("debt");
  const { toast } = useToast();
  
  const form = useForm<DebtSavingFormData>({
    resolver: zodResolver(debtSavingSchema),
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      interestRate: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: DebtSavingFormData) {
    setIsSubmitting(true);
    
    try {
      const debtSaving = {
        name: data.name,
        amount: Number(data.amount),
        type: formType,
        category_id: data.category,
        interestRate: data.interestRate ? Number(data.interestRate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      };
      
      // Enviar datos al servidor
      await apiRequest("POST", "/api/debts-savings", debtSaving);
      
      // Actualizar cache de react-query
      queryClient.invalidateQueries({ queryKey: ['/api/debts-savings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: formType === "debt" ? "Deuda registrada" : "Ahorro registrado",
        description: formType === "debt" 
          ? "La deuda ha sido registrada con éxito."
          : "El ahorro ha sido registrado con éxito.",
      });
      
      // Cerrar modal y resetear formulario
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo registrar ${formType === "debt" ? "la deuda" : "el ahorro"}. Intente nuevamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Determinar qué opciones de categoría mostrar según el tipo
  const categoryOptions = formType === "debt" ? DEBT_TYPES : SAVINGS_TYPES;
  
  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {formType === "debt" ? "Registrar nueva deuda" : "Registrar nuevo ahorro"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="flex space-x-4 mb-6">
            <Button
              type="button"
              variant={formType === "debt" ? "destructive" : "outline"}
              className="flex-1"
              onClick={() => setFormType("debt")}
            >
              Deuda
            </Button>
            <Button
              type="button"
              variant={formType === "saving" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFormType("saving")}
            >
              Ahorro
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {formType === "debt" ? "Nombre de la deuda" : "Nombre del ahorro"}
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder={formType === "debt" ? "Ej: Préstamo hipotecario" : "Ej: Fondo de emergencia"}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (€)</Label>
              <Input
                id="amount"
                {...form.register("amount")}
                placeholder="Ej: 10000"
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
              <Label htmlFor="interestRate">
                {formType === "debt" ? "Tasa de interés (%)" : "Tasa de rendimiento (%)"}
              </Label>
              <Input
                id="interestRate"
                {...form.register("interestRate")}
                placeholder={formType === "debt" ? "Ej: 4.5" : "Ej: 2.1"}
              />
            </div>
            
            {formType === "debt" && (
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  min={today}
                  {...form.register("dueDate")}
                />
              </div>
            )}
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