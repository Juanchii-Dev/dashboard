import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/formatters";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  title: string;
  date: string | Date;
  amount: number;
  type: "expense" | "income";
  icon: LucideIcon;
}

export function TransactionItem({ title, date, amount, type, icon: Icon }: TransactionItemProps) {
  const isExpense = type === "expense";

  return (
    <div className="flex items-center py-2">
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isExpense
            ? "bg-red-100 dark:bg-red-900/20"
            : "bg-green-100 dark:bg-green-900/20"
        )}
      >
        <Icon
          className={cn(
            "text-sm h-4 w-4",
            isExpense
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          )}
        />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(date)}</p>
          </div>
          <div
            className={cn(
              "text-sm font-medium",
              isExpense
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            )}
          >
            {isExpense ? "-" : "+"}{formatCurrency(Math.abs(amount))}
          </div>
        </div>
      </div>
    </div>
  );
}
