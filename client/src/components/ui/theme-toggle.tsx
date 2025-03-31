import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
            aria-label="Cambiar tema"
          >
            <Sun className="h-6 w-6 dark:hidden" />
            <Moon className="h-6 w-6 hidden dark:block" />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cambiar a modo {theme === "light" ? "oscuro" : "claro"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
