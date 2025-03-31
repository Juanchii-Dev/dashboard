import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Budgets from "@/pages/budgets";
import Goals from "@/pages/goals";
import Debts from "@/pages/debts";
import Reports from "@/pages/reports";
import Configuracion from "@/pages/configuracion";
import { ThemeProvider } from "@/context/theme-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { ChatProvider } from "@/context/chat-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatBot } from "@/components/ui/chat-bot";

function Router() {
  return (
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <ChatProvider>
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
          </ChatProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
