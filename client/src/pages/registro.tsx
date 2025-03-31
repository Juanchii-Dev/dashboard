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
import { CheckCircle2 } from "lucide-react";

// Esquema de validación para el formulario
const formSchema = z.object({
  name: z.string().optional().or(z.literal("")),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Introduce un email válido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe tener al menos un carácter especial"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type FormData = z.infer<typeof formSchema>;

export default function RegistroPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Configuración del formulario
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  // Mutación para el registro
  const registerMutation = useMutation({
    mutationFn: (data: Omit<FormData, "confirmPassword">) => 
      apiRequest("/api/register", "POST", data),
    onSuccess: () => {
      toast({
        title: "Registro completado",
        description: "Se ha enviado un email de verificación a tu correo electrónico.",
      });
      setRegistrationSuccess(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error en el registro",
        description: error.message || "No se ha podido completar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: FormData) => {
    // Enviamos todos los datos incluyendo confirmPassword
    registerMutation.mutate(data);
  };
  
  // Si el registro fue exitoso
  if (registrationSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>¡Registro completado!</CardTitle>
            <CardDescription>
              Tu cuenta ha sido creada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-green-500">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertDescription>
                Hemos enviado un correo de verificación a tu dirección de email. 
                Por favor, revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => navigate("/login")}>Ir a inicio de sesión</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear una cuenta</CardTitle>
          <CardDescription>
            Introduce tus datos para registrarte en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un carácter especial.
                    </p>
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registrando..." : "Crear cuenta"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Button variant="link" onClick={() => navigate("/login")} className="p-0">
              Iniciar sesión
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}