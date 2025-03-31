import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/theme-context";
import { Save, User, Bell, Lock, CreditCard, Euro, DollarSign, Languages } from "lucide-react";

export default function Configuracion() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const [notificaciones, setNotificaciones] = useState({
    transacciones: true,
    presupuestosExcedidos: true,
    metasAlcanzadas: true,
    consejos: false,
    informes: true
  });
  
  const [moneda, setMoneda] = useState("EUR");
  const [lenguaje, setLenguaje] = useState("es");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí implementaríamos la lógica para guardar las configuraciones
    
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas",
    });
  };

  return (
    <main className="flex-1 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">Configuración</h2>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="pagos">Métodos de pago</TabsTrigger>
          </TabsList>
          
          {/* Pestaña General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias generales</CardTitle>
                <CardDescription>
                  Configura las opciones básicas de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="theme">Tema oscuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Cambia entre tema claro y oscuro
                      </p>
                    </div>
                    <Switch 
                      checked={theme === "dark"} 
                      onCheckedChange={toggleTheme}
                      id="theme"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="currency">Moneda predeterminada</Label>
                    <Select value={moneda} onValueChange={setMoneda}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Selecciona una moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR"><div className="flex items-center"><Euro className="mr-2 h-4 w-4" />EUR - Euro</div></SelectItem>
                        <SelectItem value="USD"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />USD - Dólar estadounidense</div></SelectItem>
                        <SelectItem value="MXN"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />MXN - Peso mexicano</div></SelectItem>
                        <SelectItem value="COP"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />COP - Peso colombiano</div></SelectItem>
                        <SelectItem value="ARS"><div className="flex items-center"><DollarSign className="mr-2 h-4 w-4" />ARS - Peso argentino</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={lenguaje} onValueChange={setLenguaje}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Selecciona un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es"><div className="flex items-center"><Languages className="mr-2 h-4 w-4" />Español</div></SelectItem>
                        <SelectItem value="en"><div className="flex items-center"><Languages className="mr-2 h-4 w-4" />English</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dateFormat">Formato de fecha</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Selecciona un formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pestaña Cuenta */}
          <TabsContent value="cuenta">
            <Card>
              <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-600 dark:text-gray-300" />
                      </div>
                      <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0">
                        <span className="sr-only">Cambiar foto</span>
                        +
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input id="firstName" defaultValue="Carlos" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input id="lastName" defaultValue="Rodríguez" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue="carlos.rodriguez@ejemplo.com" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" type="tel" defaultValue="+34 612 345 678" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pestaña Notificaciones */}
          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
                <CardDescription>
                  Decide qué notificaciones quieres recibir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Transacciones realizadas</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe alertas cuando se registre una nueva transacción
                      </p>
                    </div>
                    <Switch 
                      checked={notificaciones.transacciones}
                      onCheckedChange={(checked) => 
                        setNotificaciones({...notificaciones, transacciones: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Presupuestos excedidos</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe alertas cuando superes un límite de presupuesto
                      </p>
                    </div>
                    <Switch 
                      checked={notificaciones.presupuestosExcedidos}
                      onCheckedChange={(checked) => 
                        setNotificaciones({...notificaciones, presupuestosExcedidos: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Metas alcanzadas</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe alertas cuando alcances una meta financiera
                      </p>
                    </div>
                    <Switch 
                      checked={notificaciones.metasAlcanzadas}
                      onCheckedChange={(checked) => 
                        setNotificaciones({...notificaciones, metasAlcanzadas: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consejos financieros</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe consejos periódicos para mejorar tus finanzas
                      </p>
                    </div>
                    <Switch 
                      checked={notificaciones.consejos}
                      onCheckedChange={(checked) => 
                        setNotificaciones({...notificaciones, consejos: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Informes mensuales</Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe un resumen mensual de tu actividad financiera
                      </p>
                    </div>
                    <Switch 
                      checked={notificaciones.informes}
                      onCheckedChange={(checked) => 
                        setNotificaciones({...notificaciones, informes: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>
                  <Bell className="mr-2 h-4 w-4" />
                  Guardar preferencias
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pestaña Seguridad */}
          <TabsContent value="seguridad">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad de la cuenta</CardTitle>
                <CardDescription>
                  Gestiona tu contraseña y seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <Label>Autenticación de dos factores</Label>
                      <p className="text-sm text-muted-foreground">
                        Aumenta la seguridad de tu cuenta
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>
                  <Lock className="mr-2 h-4 w-4" />
                  Actualizar contraseña
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pestaña Métodos de pago */}
          <TabsContent value="pagos">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de pago</CardTitle>
                <CardDescription>
                  Gestiona tus tarjetas y cuentas bancarias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow text-white">
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-xs uppercase tracking-wider">Tarjeta de débito</div>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="font-mono text-lg mb-4">**** **** **** 4589</div>
                    <div className="flex justify-between text-sm">
                      <div>Carlos Rodríguez</div>
                      <div>09/25</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                          <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">Cuenta Bancaria</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ES91 1234 5678 0123 4567 8901</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Añadir nuevo método de pago
                </Button>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}