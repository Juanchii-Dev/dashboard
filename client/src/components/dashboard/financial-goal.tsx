import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

interface FinancialGoalProps {
  title: string;
  current: number;
  target: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function FinancialGoal({
  title,
  current,
  target,
  icon: Icon,
  iconColor,
  iconBgColor,
}: FinancialGoalProps) {
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <div className="flex items-center">
        <div
          className={cn(
            "flex-shrink-0 rounded-full p-2",
            iconBgColor
          )}
        >
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <div className="mt-1 flex items-center">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatCurrency(current)} / {formatCurrency(target)}
              </span>
              <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
