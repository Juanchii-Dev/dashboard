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
import { GOAL_TYPES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Esquema de validación para metas
const goalSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  target: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El objetivo debe ser un número válido y mayor que cero",
  }),
  current: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "El monto actual debe ser un número válido y no negativo",
  }),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  dueDate: z.string().min(1, "Debe seleccionar una fecha"),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalForm({ isOpen, onClose }: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      target: "",
      current: "0",
      category: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: GoalFormData) {
    setIsSubmitting(true);
    
    try {
      // Validar que el monto actual no sea mayor que el objetivo
      if (Number(data.current) > Number(data.target)) {
        toast({
          title: "Error de validación",
          description: "El monto actual no puede ser mayor que el objetivo",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const goal = {
        name: data.name,
        target: Number(data.target),
        current: Number(data.current),
        category_id: data.category,
        dueDate: new Date(data.dueDate),
      };
      
      // Enviar datos al servidor
      await apiRequest("POST", "/api/goals", goal);
      
      // Actualizar cache de react-query
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: "Meta creada",
        description: "La meta financiera ha sido creada con éxito.",
      });
      
      // Cerrar modal y resetear formulario
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la meta. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nueva meta financiera</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la meta</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Ej: Viaje a Japón"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target">Objetivo (€)</Label>
              <Input
                id="target"
                {...form.register("target")}
                placeholder="Ej: 5000"
              />
              {form.formState.errors.target && (
                <p className="text-sm text-red-500">{form.formState.errors.target.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current">Monto actual (€)</Label>
              <Input
                id="current"
                {...form.register("current")}
                placeholder="Ej: 1000"
              />
              {form.formState.errors.current && (
                <p className="text-sm text-red-500">{form.formState.errors.current.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Tipo de meta</Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha objetivo</Label>
              <Input
                id="dueDate"
                type="date"
                min={today}
                {...form.register("dueDate")}
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
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