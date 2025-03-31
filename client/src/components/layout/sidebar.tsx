import { Link, useLocation } from "wouter";
import { useSidebar } from "@/context/sidebar-context";
import { X, Wallet, ArrowLeftRight, Calculator, Target, CreditCard, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const [location] = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="ml-2 text-xl font-bold font-montserrat text-gray-800 dark:text-white">Finance App</h1>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            onClick={close}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-1">
            <NavItem href="/" icon={<Wallet />} text="Panel principal" active={location === "/"} />
            <NavItem
              href="/transacciones"
              icon={<ArrowLeftRight />}
              text="Transacciones"
              active={location === "/transacciones"}
            />
            <NavItem
              href="/presupuestos"
              icon={<Calculator />}
              text="Presupuestos"
              active={location === "/presupuestos"}
            />
            <NavItem href="/metas" icon={<Target />} text="Metas financieras" active={location === "/metas"} />
            <NavItem href="/deudas" icon={<CreditCard />} text="Deudas y ahorros" active={location === "/deudas"} />
            <NavItem href="/informes" icon={<PieChart />} text="Informes" active={location === "/informes"} />
          </div>
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Carlos Rodríguez</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ver perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active: boolean;
}

function NavItem({ href, icon, text, active }: NavItemProps) {
  const { close } = useSidebar();

  return (
    <Link href={href}>
      <a
        className={cn(
          "w-full flex items-center px-4 py-3 text-base font-medium rounded-md",
          active
            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        )}
        onClick={() => close()}
      >
        <span className="w-5 h-5 mr-3">{icon}</span>
        {text}
      </a>
    </Link>
  );
}
