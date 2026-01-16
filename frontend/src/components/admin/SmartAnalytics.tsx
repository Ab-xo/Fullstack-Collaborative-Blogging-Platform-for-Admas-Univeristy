import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Users,
  Eye,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface AnalyticsData {
  posts: { total: number; published: number; pending: number; views: number; };
  users: { total: number; active: number; new: number; };
  engagement: { likes: number; comments: number; shares: number; };
  trends: { views: number; users: number; engagement: number; };
}

interface SmartAnalyticsProps {
  data: AnalyticsData;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ElementType;
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

const SmartAnalytics: React.FC<SmartAnalyticsProps> = ({ data }) => {
  // Generate smart insights based on data
  const insights = useMemo<Insight[]>(() => {
    const results: Insight[] = [];

    // Engagement Rate Analysis
    const engagementRate = data.posts.total > 0 
      ? ((data.engagement.likes + data.engagement.comments) / data.posts.views) * 100 
      : 0;

    if (engagementRate > 5) {
      results.push({
        type: 'success',
        icon: Zap,
        title: 'High Engagement Rate',
        description: `Your content is performing exceptionally well with ${engagementRate.toFixed(1)}% engagement rate.`,
        metric: `${engagementRate.toFixed(1)}%`,
        action: 'Keep creating similar content',
      });
    } else if (engagementRate < 2) {
      results.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Low Engagement',
        description: 'Consider improving content quality or posting frequency to boost engagement.',
        metric: `${engagementRate.toFixed(1)}%`,
        action: 'Review content strategy',
      });
    }

    // User Activity Analysis
    const activeUserRate = data.users.total > 0 
      ? (data.users.active / data.users.total) * 100 
      : 0;

    if (activeUserRate > 60) {
      results.push({
        type: 'success',
        icon: Users,
        title: 'Strong User Activity',
        description: `${activeUserRate.toFixed(0)}% of your users are actively engaged with the platform.`,
        metric: `${activeUserRate.toFixed(0)}%`,
      });
    } else if (activeUserRate < 30) {
      results.push({
        type: 'warning',
        icon: Users,
        title: 'User Retention Opportunity',
        description: 'Consider implementing engagement campaigns to activate dormant users.',
        metric: `${activeUserRate.toFixed(0)}%`,
        action: 'Launch re-engagement campaign',
      });
    }

    // Content Moderation Analysis
    const pendingRate = data.posts.total > 0 
      ? (data.posts.pending / data.posts.total) * 100 
      : 0;

    if (pendingRate > 20) {
      results.push({
        type: 'danger',
        icon: AlertCircle,
        title: 'Moderation Backlog',
        description: `${data.posts.pending} posts are pending review. Quick moderation improves user experience.`,
        metric: `${data.posts.pending} pending`,
        action: 'Review pending posts',
      });
    }

    // Growth Trend Analysis
    if (data.trends.users > 10) {
      results.push({
        type: 'success',
        icon: TrendingUp,
        title: 'User Growth Surge',
        description: `User base growing ${data.trends.users}% faster than last period.`,
        metric: `+${data.trends.users}%`,
      });
    } else if (data.trends.users < -5) {
      results.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'User Growth Declining',
        description: 'User acquisition is slowing. Consider marketing initiatives.',
        metric: `${data.trends.users}%`,
        action: 'Review acquisition strategy',
      });
    }

    // Content Performance
    const avgViewsPerPost = data.posts.published > 0 
      ? data.posts.views / data.posts.published 
      : 0;

    if (avgViewsPerPost > 100) {
      results.push({
        type: 'success',
        icon: Eye,
        title: 'Strong Content Reach',
        description: `Posts averaging ${Math.round(avgViewsPerPost)} views each.`,
        metric: `${Math.round(avgViewsPerPost)} avg views`,
      });
    }

    // Engagement Trend
    if (data.trends.engagement > 15) {
      results.push({
        type: 'success',
        icon: Heart,
        title: 'Engagement Momentum',
        description: 'User engagement is accelerating. Your community is thriving!',
        metric: `+${data.trends.engagement}%`,
      });
    }

    return results;
  }, [data]);

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10';
      case 'danger':
        return 'border-red-200 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'danger':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI-powered analytics and recommendations
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Everything looks good! Keep up the great work.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${getIconColor(insight.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">
                          {insight.title}
                        </h4>
                        {insight.metric && (
                          <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <button className="text-xs font-medium text-primary hover:underline">
                          {insight.action} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAnalytics;
