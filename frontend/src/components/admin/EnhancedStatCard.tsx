import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  gradient: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  onClick?: () => void;
}

const gradientConfigs = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/20',
  },
  green: {
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
  purple: {
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    glow: 'shadow-violet-500/20',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'shadow-orange-500/20',
  },
  red: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'shadow-red-500/20',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    glow: 'shadow-pink-500/20',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    glow: 'shadow-indigo-500/20',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    glow: 'shadow-teal-500/20',
  },
};

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  gradient,
  description,
  prefix = '',
  suffix = '',
  onClick,
}) => {
  const config = gradientConfigs[gradient as keyof typeof gradientConfigs] || gradientConfigs.blue;

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <ArrowUp className="h-3.5 w-3.5" />;
      case 'down':
        return <ArrowDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getTrendStyles = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'down':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-muted/30 shadow-lg hover:shadow-xl ${config.glow} transition-all duration-300 ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-[0.03]`} />
        
        {/* Decorative Elements */}
        <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${config.gradient} opacity-[0.08] rounded-full blur-3xl`} />
        <div className={`absolute -left-8 -bottom-8 w-24 h-24 bg-gradient-to-br ${config.gradient} opacity-[0.05] rounded-full blur-2xl`} />

        <CardContent className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2 truncate">
                {title}
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <motion.h3 
                  className="text-4xl font-bold tracking-tight"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {prefix}{formatValue(value)}{suffix}
                </motion.h3>
                {trend && trend.value !== 0 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTrendStyles()}`}
                  >
                    {getTrendIcon()}
                    <span>{Math.abs(trend.value)}%</span>
                  </motion.div>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {description}
                </p>
              )}
              {trend?.label && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {trend.label}
                </p>
              )}
            </div>

            {/* Icon Container */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow}`}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
          </div>

          {/* Animated Progress Bar */}
          {trend && (
            <div className="mt-5">
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max(Math.abs(trend.value) * 2, 10), 100)}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedStatCard;
