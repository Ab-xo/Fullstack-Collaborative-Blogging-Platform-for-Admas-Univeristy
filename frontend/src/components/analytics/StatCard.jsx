import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  onClick,
}) => {
  const colorClasses = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    yellow: "border-l-yellow-500",
    red: "border-l-red-500",
    purple: "border-l-purple-500",
    pink: "border-l-pink-500",
  };

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    green:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    yellow:
      "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
    red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "glass card-hover border-l-4 transition-all duration-300",
          colorClasses[color] || colorClasses.blue,
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          {Icon && (
            <div
              className={cn(
                "p-2 rounded-lg",
                iconColorClasses[color] || iconColorClasses.blue
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={trend.direction === "up" ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.value}%</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs last period
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
