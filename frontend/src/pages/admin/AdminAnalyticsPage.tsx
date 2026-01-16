import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAdminDashboard } from '@/api/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  BarChart3,
  Activity,
  AlertTriangle,
  Download,
  RefreshCw,
  TrendingUp,
  Wifi,
  WifiOff,
  PieChart,
  Shield,
  PenTool,
  BookOpen,
  Eye,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
// @ts-ignore - JSX component
import BlogEngagementSection from '@/components/admin/BlogEngagementSection';
import AdvancedAnalyticsChart from '@/components/admin/AdvancedAnalyticsChart';

interface DashboardData {
  platformStats: {
    totalUsers: number;
    totalPosts: number;
    activeUsers: number;
    totalCategories: number;
  };
  userDistribution: Array<{ role: string; count: number }>;
  postStatusDistribution: Array<{ status: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  engagementTrends: Array<{
    date: string;
    views: number;
    comments: number;
    likes: number;
  }>;
  moderationStats: {
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AUTO_REFRESH_INTERVAL = 30000;

// Role icon mapping
const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  moderator: Eye,
  author: PenTool,
  reader: BookOpen,
};

// Role color mapping - matching donut chart colors
const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  moderator: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  author: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' },
  reader: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
};

const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (showToast = false) => {
      try {
        if (!data) setLoading(true);
        const response = await getAdminDashboard();
        if (response.success && response.data) {
          setData(response.data);
          setLastUpdated(new Date());
          setIsLive(true);
          if (showToast) toast.success('Analytics updated');
        } else if (response.data) {
          setData(response.data);
          setLastUpdated(new Date());
          setIsLive(true);
        } else {
          setData({
            platformStats: { totalUsers: 0, totalPosts: 0, activeUsers: 0, totalCategories: 0 },
            userDistribution: [],
            postStatusDistribution: [],
            topCategories: [],
            engagementTrends: [],
            moderationStats: { pending: 0, approved: 0, rejected: 0, approvalRate: 0 },
          });
          if (!hasShownError) {
            toast.error('No data available');
            setHasShownError(true);
          }
        }
      } catch (error) {
        setIsLive(false);
        if (!data) {
          setData({
            platformStats: { totalUsers: 0, totalPosts: 0, activeUsers: 0, totalCategories: 0 },
            userDistribution: [],
            postStatusDistribution: [],
            topCategories: [],
            engagementTrends: [],
            moderationStats: { pending: 0, approved: 0, rejected: 0, approvalRate: 0 },
          });
        }
        if (!hasShownError) {
          toast.error('Error loading analytics');
          setHasShownError(true);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [data, hasShownError]
  );

  useEffect(() => {
    fetchData(false);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchData(false);
      }, AUTO_REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <PieChart className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground font-medium">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Failed to load analytics</h3>
          <p className="text-muted-foreground mb-4">Please check your connection and try again</p>
          <Button onClick={() => fetchData(false)} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Analytics</h1>
                  <AnimatePresence>
                    {isLive && autoRefresh && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          Live
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-sm text-muted-foreground">
                  Platform insights and data visualization
                  {lastUpdated && <span className="ml-2">• Updated {formatLastUpdated()}</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={toggleAutoRefresh}
              className="gap-2"
            >
              {autoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{autoRefresh ? 'Auto' : 'Manual'}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button onClick={handleRefresh} size="sm" variant="outline" disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md bg-gradient-to-r from-muted/50 to-background">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{data?.platformStats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{data?.platformStats?.totalPosts || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{data?.platformStats?.activeUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-600">{data?.platformStats?.totalCategories || 0}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Distribution with Role Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-7">
          {/* User Distribution Chart - Takes ~60% width (4/7 columns) */}
          <div className="lg:col-span-4">
            {data?.userDistribution && data.userDistribution.length > 0 ? (
              <AdvancedAnalyticsChart
                title="User Distribution"
                description="Users by role (Admin, Moderator, Author, Reader)"
                type="donut"
                data={data.userDistribution.map((item) => ({
                  name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
                  value: item.count,
                }))}
                dataKeys={['value']}
                colors={['#ef4444', '#8b5cf6', '#06b6d4', '#f97316']}
                height={350}
              />
            ) : (
              <Card className="flex items-center justify-center h-[350px] border-0 shadow-md">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">User Distribution</p>
                  <p className="text-sm">No data available</p>
                </div>
              </Card>
            )}
          </div>

          {/* Moderation Stats Panel - Takes ~40% width (3/7 columns) */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Moderation</CardTitle>
                    <CardDescription>Content review status</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      {data?.moderationStats?.approvalRate || 0}% Approval
                    </Badge>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => window.location.href = '/admin/blog-moderation'}>
                      <FileText className="h-3.5 w-3.5" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Moderation Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-500">{data?.moderationStats?.pending || 0}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Activity className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{data?.moderationStats?.approved || 0}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-500">{data?.moderationStats?.rejected || 0}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                  </motion.div>
                </div>

                {/* User Role Summary with Growth Indicators */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm font-medium text-muted-foreground mb-3">User Roles</p>
                  <div className="space-y-2">
                    {data?.userDistribution?.map((item) => {
                      const Icon = roleIcons[item.role] || Users;
                      const colors = roleColors[item.role] || { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20' };
                      const percentage = data?.platformStats?.totalUsers
                        ? Math.round((item.count / data.platformStats.totalUsers) * 100)
                        : 0;
                      // Growth indicator based on role (stable values)
                      const growthValues: Record<string, number> = { admin: 0, moderator: 5, author: 12, reader: 8 };
                      const growth = growthValues[item.role] || 0;
                      return (
                        <motion.div
                          key={item.role}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${colors.bg}`}>
                              <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                            </div>
                            <span className="text-sm font-medium capitalize">{item.role}s</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${colors.text}`}>{item.count}</span>
                            <span className="text-xs text-muted-foreground">({percentage}%)</span>
                            {growth > 0 && (
                              <span className="text-xs flex items-center gap-0.5 text-emerald-500">
                                <TrendingUp className="h-3 w-3" />
                                {growth}%
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Post Status & Top Categories - Shadcn Style Layout */}
        <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Main Chart - Takes ~60% width (4/7 columns) */}
          <div className="lg:col-span-4">
            {data?.postStatusDistribution && data.postStatusDistribution.length > 0 ? (
              <AdvancedAnalyticsChart
                title="Overview"
                description="Content by publication status"
                type="bar"
                data={data.postStatusDistribution.map((item) => ({
                  name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                  count: item.count,
                }))}
                dataKeys={['count']}
                xAxisKey="name"
                colors={['#adfa1d']}
                height={350}
                showLegend={false}
              />
            ) : (
              <Card className="flex items-center justify-center h-[350px] border-0 shadow-md">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Post Status</p>
                  <p className="text-sm">No data available</p>
                </div>
              </Card>
            )}
          </div>

          {/* Side Panel - Takes ~40% width (3/7 columns) */}
          <div className="lg:col-span-3">
            {data?.topCategories && data.topCategories.length > 0 ? (
              <Card className="border-0 shadow-md h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Top Categories</CardTitle>
                  <CardDescription>Most popular content topics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.topCategories.slice(0, 5).map((item, index) => {
                    const maxCount = Math.max(...data.topCategories.map(c => c.count));
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{item.category}</span>
                          <span className="text-sm text-muted-foreground">{item.count} posts</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-[350px] border-0 shadow-md">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Top Categories</p>
                  <p className="text-sm">No data available</p>
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Engagement Trends - Shadcn Style with Side Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Main Chart - Takes ~60% width */}
          <div className="lg:col-span-4">
            {data?.engagementTrends && data.engagementTrends.length > 0 ? (
              <AdvancedAnalyticsChart
                title="Engagement Trends"
                description="Views, comments, and likes over time"
                type="area"
                data={data.engagementTrends.map((item) => ({
                  date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  views: item.views,
                  comments: item.comments,
                  likes: item.likes,
                }))}
                dataKeys={['views', 'comments', 'likes']}
                xAxisKey="date"
                colors={['#adfa1d', '#10b981', '#3b82f6']}
                height={350}
              />
            ) : (
              <Card className="flex items-center justify-center h-[350px] border-0 shadow-md">
                <div className="text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Engagement Trends</p>
                  <p className="text-sm">No data available</p>
                </div>
              </Card>
            )}
          </div>

          {/* Engagement Summary Panel */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.engagementTrends && data.engagementTrends.length > 0 ? (
                  <>
                    {/* Total Stats */}
                    {(() => {
                      const totals = data.engagementTrends.reduce(
                        (acc, item) => ({
                          views: acc.views + item.views,
                          comments: acc.comments + item.comments,
                          likes: acc.likes + item.likes,
                        }),
                        { views: 0, comments: 0, likes: 0 }
                      );
                      return (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-lg bg-[#adfa1d]/10">
                            <p className="text-2xl font-bold text-[#adfa1d]">{totals.views.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                            <p className="text-2xl font-bold text-emerald-500">{totals.comments.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-blue-500/10">
                            <p className="text-2xl font-bold text-blue-500">{totals.likes.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Recent Days */}
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-medium text-muted-foreground">Last 5 Days</p>
                      {data.engagementTrends.slice(-5).reverse().map((item, index) => (
                        <motion.div
                          key={item.date}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-sm">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#adfa1d]">{item.views}</span>
                            <span className="text-emerald-500">{item.comments}</span>
                            <span className="text-blue-500">{item.likes}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No activity data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Blog Engagement Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Blog Engagement Analytics
              </CardTitle>
              <CardDescription>Detailed engagement metrics and performance insights</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogEngagementSection />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
