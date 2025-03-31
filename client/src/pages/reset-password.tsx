import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Esquema para restablecimiento de contraseña
const resetPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Obtener el token de la URL
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  
  // Si no hay token, mostrar error
  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error en el enlace</CardTitle>
            <CardDescription>
              El enlace de restablecimiento no es válido o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                El enlace que has utilizado no contiene un token válido. Por favor, solicita un nuevo enlace de restablecimiento.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => navigate("/login")}>Volver a inicio de sesión</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Configuración del formulario
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  
  // Mutación para restablecer contraseña
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { password: string, token: string }) => 
      apiRequest("/api/reset-password", "POST", data),
    onSuccess: () => {
      toast({
        title: "Contraseña restablecida",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });
      setResetSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error al restablecer",
        description: error.message || "No se pudo restablecer la contraseña. El enlace podría haber expirado.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate({ 
      password: data.password,
      token
    });
  };
  
  // Si el restablecimiento fue exitoso
  if (resetSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>¡Contraseña restablecida!</CardTitle>
            <CardDescription>
              Tu contraseña ha sido actualizada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => navigate("/login")}>Iniciar sesión</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>
            Introduce una nueva contraseña para tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Restableciendo..." : "Restablecer contraseña"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}