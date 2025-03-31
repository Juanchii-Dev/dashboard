import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy } from "react";
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

// Lazy loading de componentes para mejorar rendimiento
const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Budgets = lazy(() => import("@/pages/budgets"));
const Goals = lazy(() => import("@/pages/goals"));
const Debts = lazy(() => import("@/pages/debts"));
const Reports = lazy(() => import("@/pages/reports"));
const Configuracion = lazy(() => import("@/pages/configuracion"));

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
  
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
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
