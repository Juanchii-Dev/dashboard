import { useSidebar } from "@/context/sidebar-context";
import { useChat } from "@/context/chat-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Bell, Settings, MessageSquare } from "lucide-react";

export function Navbar() {
  const { toggle } = useSidebar();
  const { toggleChat } = useChat();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={toggle}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="lg:hidden ml-2 font-montserrat font-bold text-lg text-gray-800 dark:text-white">
              Finance App
            </div>
          </div>

          {/* Search and header actions */}
          <div className="flex items-center">
            {/* Search */}
            <div className="relative w-full max-w-lg mr-4 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-primary dark:focus:ring-primary-400 focus:border-primary dark:focus:border-primary-400 sm:text-sm"
                placeholder="Buscar transacciones, presupuestos..."
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 relative"
            >
              <span className="sr-only">Ver notificaciones</span>
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
            >
              <span className="sr-only">Ajustes</span>
              <Settings className="h-6 w-6" />
            </Button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Chat button */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
              onClick={toggleChat}
            >
              <span className="sr-only">Abrir chatbot</span>
              <MessageSquare className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
