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

// Esquema de validación para presupuestos
const budgetSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  limit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El límite debe ser un número válido y mayor que cero",
  }),
  category: z.string().min(1, "Debe seleccionar una categoría"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetForm({ isOpen, onClose }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      limit: "",
      category: "",
    },
  });

  async function onSubmit(data: BudgetFormData) {
    setIsSubmitting(true);
    
    try {
      const budget = {
        name: data.name,
        limit: Number(data.limit),
        category_id: parseInt(data.category),
      };
      
      // Enviar datos al servidor
      await apiRequest("POST", "/api/budgets", budget);
      
      // Actualizar cache de react-query
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto ha sido creado con éxito.",
      });
      
      // Cerrar modal y resetear formulario
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el presupuesto. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo presupuesto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Ej: Comestibles"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limit">Límite mensual (€)</Label>
              <Input
                id="limit"
                {...form.register("limit")}
                placeholder="Ej: 500"
              />
              {form.formState.errors.limit && (
                <p className="text-sm text-red-500">{form.formState.errors.limit.message}</p>
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
                  {CATEGORIES.EXPENSE.map((category) => (
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