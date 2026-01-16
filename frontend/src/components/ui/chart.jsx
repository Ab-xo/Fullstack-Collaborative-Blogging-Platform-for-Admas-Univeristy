/**
 * ============================================================================
 * SHADCN CHART COMPONENTS
 * ============================================================================
 * Industry-level chart components using Recharts with shadcn styling
 */

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import { cn } from "../../lib/utils";

// Chart Container
export const ChartContainer = React.forwardRef(
  ({ className, children, config, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-full", className)}
        style={{
          "--color-primary": "hsl(221.2 83.2% 53.3%)",
          "--color-secondary": "hsl(262.1 83.3% 57.8%)",
          "--color-success": "hsl(142.1 76.2% 36.3%)",
          "--color-warning": "hsl(38 92% 50%)",
          "--color-danger": "hsl(0 84.2% 60.2%)",
          ...config,
        }}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

// Custom Tooltip
export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[150px]">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatter
                ? formatter(entry.value)
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Legend
export const ChartLegend = ({ payload }) => {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Export Recharts components for convenience
export {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart,
};

// Color palette for charts
export const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
  orange: "#f97316",
};

export const GRADIENT_COLORS = [
  { start: "#3b82f6", end: "#1d4ed8" },
  { start: "#8b5cf6", end: "#6d28d9" },
  { start: "#22c55e", end: "#15803d" },
  { start: "#f59e0b", end: "#d97706" },
  { start: "#ef4444", end: "#dc2626" },
];
