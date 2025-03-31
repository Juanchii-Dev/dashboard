import { useState } from "react";
import { X, Move, Maximize2, Minimize2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Widget } from "@/context/widget-context";

interface WidgetContainerProps {
  widget: Widget;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: Widget["size"]) => void;
  className?: string;
  isDraggable?: boolean;
  dragHandleProps?: any;
}

export function WidgetContainer({
  widget,
  children,
  onRemove,
  onSizeChange,
  className,
  isDraggable = false,
  dragHandleProps
}: WidgetContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Manejadores para cambiar tamaño
  const handleSizeToggle = () => {
    if (widget.size === "small") {
      onSizeChange(widget.id, "medium");
    } else if (widget.size === "medium") {
      onSizeChange(widget.id, "large");
    } else {
      onSizeChange(widget.id, "small");
    }
  };

  // Manejador para expandir/colapsar
  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Determinar clases basadas en el tamaño
  const sizeClasses = {
    small: "col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3",
    medium: "col-span-12 sm:col-span-6 lg:col-span-6",
    large: "col-span-12"
  };

  // Expandir a pantalla completa si está expandido
  const containerClasses = isExpanded
    ? "fixed inset-4 z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-auto"
    : sizeClasses[widget.size];

  return (
    <Card 
      className={cn(
        containerClasses, 
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDraggable && (
              <div 
                {...dragHandleProps}
                className="cursor-move p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Move size={16} />
              </div>
            )}
            <CardTitle className="text-base">{widget.title}</CardTitle>
          </div>
          
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSizeToggle}
            >
              {widget.size === "large" ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleExpandToggle}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRemove(widget.id)}>
                  <X className="mr-2 h-4 w-4" />
                  Quitar widget
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onSizeChange(widget.id, "small")}
                  className={widget.size === "small" ? "bg-accent text-accent-foreground" : ""}
                >
                  Pequeño
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSizeChange(widget.id, "medium")}
                  className={widget.size === "medium" ? "bg-accent text-accent-foreground" : ""}
                >
                  Mediano
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSizeChange(widget.id, "large")}
                  className={widget.size === "large" ? "bg-accent text-accent-foreground" : ""}
                >
                  Grande
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}