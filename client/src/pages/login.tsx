import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Esquema para inicio de sesión
const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Esquema para código de verificación de dos factores
const twoFactorSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

// Esquema para recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z.string().email("Introduce un email válido"),
});

// Tipos para los datos de los formularios
type LoginFormData = z.infer<typeof loginSchema>;
type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  
  // Formulario de inicio de sesión
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  
  // Formulario de verificación de dos factores
  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: ""
    }
  });
  
  // Formulario de recuperación de contraseña
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Mutación para inicio de sesión
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => apiRequest("/api/login", "POST", data),
    onSuccess: (data: any) => {
      if (data.requireTwoFactor) {
        toast({
          title: "Verificación requerida",
          description: "Hemos enviado un código a tu correo electrónico.",
        });
        setUserEmail(loginForm.getValues().email);
        setShowTwoFactor(true);
      } else {
        // Procesar inicio de sesión exitoso
        login(data.token, data.user);
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo.",
        });
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para verificación de dos factores
  const twoFactorMutation = useMutation({
    mutationFn: (data: TwoFactorFormData & { email: string }) => 
      apiRequest("/api/verify-two-factor", "POST", data),
    onSuccess: (data: any) => {
      login(data.token, data.user);
      toast({
        title: "Verificación exitosa",
        description: "Bienvenido de nuevo.",
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error de verificación",
        description: error.message || "Código incorrecto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para recuperación de contraseña
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => 
      apiRequest("/api/forgot-password", "POST", data),
    onSuccess: () => {
      setResetPasswordSent(true);
      toast({
        title: "Solicitud enviada",
        description: "Si la dirección de correo existe, recibirás instrucciones para restablecer tu contraseña.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la solicitud",
        description: error.message || "No se pudo procesar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Manejar envío de formulario de inicio de sesión
  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };
  
  // Manejar envío de formulario de verificación de dos factores
  const onTwoFactorSubmit = (data: TwoFactorFormData) => {
    twoFactorMutation.mutate({ ...data, email: userEmail });
  };
  
  // Manejar envío de formulario de recuperación de contraseña
  const onForgotPasswordSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };
  
  // Si estamos en proceso de verificación de dos factores
  if (showTwoFactor) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verificación de dos factores</CardTitle>
            <CardDescription>
              Introduce el código de 6 dígitos que hemos enviado a tu correo electrónico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...twoFactorForm}>
              <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorSubmit)} className="space-y-4">
                <FormField
                  control={twoFactorForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de verificación</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} maxLength={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={twoFactorMutation.isPending}
                >
                  {twoFactorMutation.isPending ? "Verificando..." : "Verificar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => setShowTwoFactor(false)}>
              Volver al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Acceder a tu cuenta</CardTitle>
              <TabsList>
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="reset">Recuperar</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>
              Ingresa tus datos para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
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
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="reset">
              {resetPasswordSent ? (
                <Alert>
                  <AlertDescription>
                    Si la dirección de correo existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="ejemplo@correo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? "Enviando..." : "Recuperar contraseña"}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Button variant="link" onClick={() => navigate("/registro")} className="p-0">
                Regístrate
              </Button>
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}