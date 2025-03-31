import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { LucideIcon } from "lucide-react";

interface FinancialCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  footerLink?: string;
  footerText?: string;
}

export function FinancialCard({
  title,
  amount,
  icon: Icon,
  iconColor,
  iconBgColor,
  footerLink = "#",
  footerText = "Ver detalles",
}: FinancialCardProps) {
  return (
    <Card className="overflow-hidden shadow transition-all duration-200 hover:shadow-lg dark:hover:shadow-gray-800/20">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div
            className={cn(
              "flex-shrink-0 rounded-md p-3",
              iconBgColor
            )}
          >
            <Icon className={cn("text-xl h-6 w-6", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <a
            href={footerLink}
            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            {footerText} →
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
