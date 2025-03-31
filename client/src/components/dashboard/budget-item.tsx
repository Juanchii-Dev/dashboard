import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface BudgetItemProps {
  name: string;
  spent: number;
  limit: number;
}

export function BudgetItem({ name, spent, limit }: BudgetItemProps) {
  const percentage = (spent / limit) * 100;
  const isOverBudget = spent > limit;
  const isNearLimit = percentage >= 90 && percentage <= 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-500",
            isOverBudget 
              ? "bg-red-600 dark:bg-red-500" 
              : isNearLimit 
                ? "bg-yellow-600 dark:bg-yellow-500" 
                : "bg-green-600 dark:bg-green-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
