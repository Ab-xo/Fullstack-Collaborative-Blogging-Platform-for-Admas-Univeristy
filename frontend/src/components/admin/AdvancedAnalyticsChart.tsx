import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MoreHorizontal, TrendingUp, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  [key: string]: string | number;
}

interface AdvancedAnalyticsChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radial';
  dataKeys: string[];
  xAxisKey?: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  animate?: boolean;
}

const DEFAULT_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-2xl">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const AdvancedAnalyticsChart: React.FC<AdvancedAnalyticsChartProps> = ({
  title,
  description,
  data,
  type,
  dataKeys,
  xAxisKey = 'name',
  colors = DEFAULT_COLORS,
  height = 320,
  showLegend = true,
  animate = true,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`line-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend content={<CustomLegend />} />}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={animate ? 1500 : 0}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`area-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend content={<CustomLegend />} />}
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  fill={`url(#area-gradient-${key})`}
                  animationDuration={animate ? 1500 : 0}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="20%">
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`bar-gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
              {showLegend && <Legend content={<CustomLegend />} />}
              {dataKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`url(#bar-gradient-${key})`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  animationDuration={animate ? 1500 : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        const isDonut = type === 'donut';
        const total = data.reduce((sum, item) => sum + (Number(item[dataKeys[0]]) || 0), 0);
        return (
          <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <defs>
                {data.map((_, idx) => (
                  <linearGradient key={idx} id={`pie-gradient-${idx}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={colors[idx % colors.length]} stopOpacity={1} />
                    <stop offset="100%" stopColor={colors[idx % colors.length]} stopOpacity={0.8} />
                  </linearGradient>
                ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={isDonut ? 60 : 0}
                  outerRadius={100}
                  paddingAngle={isDonut ? 4 : 2}
                  dataKey={dataKeys[0]}
                  animationDuration={animate ? 1500 : 0}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell 
                      key={`cell-${i}`} 
                      fill={`url(#pie-gradient-${i})`}
                      className="drop-shadow-md"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {isDonut && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold">{total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            )}
            {/* Custom Legend for Pie */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium">{String(item.name)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({((Number(item[dataKeys[0]]) / total) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">{renderChart()}</CardContent>
      </Card>
    </motion.div>
  );
};

export default AdvancedAnalyticsChart;
