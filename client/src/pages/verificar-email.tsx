import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerificarEmailPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading");
  
  // Obtener el token de la URL
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get("token");
  
  // Mutación para verificar el email
  const verifyEmailMutation = useMutation({
    mutationFn: (data: { token: string }) => apiRequest("/api/verify-email", "POST", data),
    onSuccess: () => {
      setVerificationStatus("success");
      toast({
        title: "Correo electrónico verificado",
        description: "Tu cuenta ha sido verificada exitosamente.",
      });
    },
    onError: (error: any) => {
      setVerificationStatus("error");
      toast({
        title: "Error de verificación",
        description: error.message || "No se pudo verificar tu correo electrónico. El enlace podría haber expirado.",
        variant: "destructive",
      });
    }
  });
  
  // Verificar el email al cargar la página
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    } else {
      setVerificationStatus("error");
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificación de correo electrónico</CardTitle>
          <CardDescription>
            {verificationStatus === "loading" && "Verificando tu correo electrónico..."}
            {verificationStatus === "success" && "Tu correo electrónico ha sido verificado."}
            {verificationStatus === "error" && "Error al verificar tu correo electrónico."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationStatus === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Procesando tu solicitud...</p>
            </div>
          )}
          
          {verificationStatus === "success" && (
            <Alert className="border-green-500 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle>¡Verificación exitosa!</AlertTitle>
              <AlertDescription>
                Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión y acceder a todas las funcionalidades de la plataforma.
              </AlertDescription>
            </Alert>
          )}
          
          {verificationStatus === "error" && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Error de verificación</AlertTitle>
              <AlertDescription>
                {!token 
                  ? "El enlace que has utilizado no contiene un token válido."
                  : "No se pudo verificar tu correo electrónico. El enlace podría haber expirado o ya ha sido utilizado."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/login")}>
            Ir a inicio de sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}