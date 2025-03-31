import { Route, Switch, useLocation } from "wouter";
import React, { Suspense, lazy, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { ChatProvider } from "@/context/chat-context";
import { NotificationProvider } from "@/context/notification-context";
import { WidgetProvider } from "@/context/widget-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatBot } from "@/components/ui/chat-bot";

// Lazy loading de componentes para mejorar rendimiento con prefetch cuando sea necesario
const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => 
  Promise.all([
    import("@/pages/transactions"),
    new Promise(resolve => setTimeout(resolve, 300)) // Pequeño retraso para asegurar animaciones fluidas
  ]).then(([module]) => module)
);
const Budgets = lazy(() => 
  Promise.all([
    import("@/pages/budgets"),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);
const Goals = lazy(() => 
  Promise.all([
    import("@/pages/goals"),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);
const Debts = lazy(() => 
  Promise.all([
    import("@/pages/debts"),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);
const Reports = lazy(() => 
  Promise.all([
    import("@/pages/reports"),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);
const Configuracion = lazy(() => 
  Promise.all([
    import("@/pages/configuracion"),
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => module)
);

// Componente de carga para mostrar durante la carga de componentes lazy
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  
  // Prefetching optimizado: precarga la página del dashboard 
  // y la página de configuración después de la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prefetch de páginas importantes
      import("@/pages/dashboard");
      import("@/pages/configuracion");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Historial de navegación con scroll restoration
  useEffect(() => {
    // Guarda la posición del scroll actual
    const saveScrollPosition = () => {
      const scrollPosition = window.scrollY;
      sessionStorage.setItem(`scroll_${location}`, scrollPosition.toString());
    };
    
    // Función para restaurar la posición del scroll
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem(`scroll_${location}`);
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
      } else {
        window.scrollTo(0, 0);
      }
    };
    
    // Evento para guardar posición al navegar
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Restaura la posición después de que los componentes se rendericen
    const timer = setTimeout(restoreScrollPosition, 50);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      clearTimeout(timer);
      saveScrollPosition();
    };
  }, [location]);
  
  return (
    <div className="page-transition-container">
      <Suspense fallback={<LoadingFallback />}>
        <div className="page-transition" key={location}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/transacciones" component={Transactions} />
            <Route path="/presupuestos" component={Budgets} />
            <Route path="/metas" component={Goals} />
            <Route path="/deudas" component={Debts} />
            <Route path="/informes" component={Reports} />
            <Route path="/configuracion" component={Configuracion} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <ChatProvider>
            <NotificationProvider>
              <WidgetProvider>
                <div className="min-h-screen font-inter bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
                  <Sidebar />
                  <div className="lg:pl-64 flex flex-col min-h-screen">
                    <Navbar />
                    <Router />
                    <Footer />
                  </div>
                  <ChatBot />
                </div>
                <Toaster />
              </WidgetProvider>
            </NotificationProvider>
          </ChatProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
