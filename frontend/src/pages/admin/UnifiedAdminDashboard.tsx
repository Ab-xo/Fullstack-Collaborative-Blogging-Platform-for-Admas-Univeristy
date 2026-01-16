import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
// @ts-ignore - JS module
import { getAdminDashboard } from '@/api/analytics';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DashboardData {
  platformStats: {
    totalUsers: number;
    totalPosts: number;
    activeUsers: number;
    totalCategories: number;
    totalViews?: number;
    totalLikes?: number;
    totalComments?: number;
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

const UnifiedAdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      if (!data) setLoading(true);

      const response = await getAdminDashboard();

      if (response.success && response.data) {
        setData(response.data);
        if (showToast) toast.success('Dashboard updated');
      } else if (response.data) {
        setData(response.data);
      } else {
        setData({
          platformStats: { totalUsers: 0, totalPosts: 0, activeUsers: 0, totalCategories: 0 },
          userDistribution: [],
          postStatusDistribution: [],
          topCategories: [],
          engagementTrends: [],
          moderationStats: { pending: 0, approved: 0, rejected: 0, approvalRate: 0 },
        });
      }
    } catch (error) {
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
  };

  // Calculate totals from engagement trends
  const totalViews = data?.engagementTrends?.reduce((sum, t) => sum + (t.views || 0), 0) || 0;
  const totalLikes = data?.engagementTrends?.reduce((sum, t) => sum + (t.likes || 0), 0) || 0;
  const totalComments = data?.engagementTrends?.reduce((sum, t) => sum + (t.comments || 0), 0) || 0;

  // Get post status counts
  const publishedPosts = data?.postStatusDistribution?.find(p => p.status === 'published')?.count || 0;
  const pendingPosts = data?.postStatusDistribution?.find(p => p.status === 'pending')?.count || 0;
  const rejectedPosts = data?.postStatusDistribution?.find(p => p.status === 'rejected')?.count || 0;

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground font-medium">Loading dashboard...</p>
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
          <h3 className="text-xl font-semibold mb-2">Failed to load dashboard</h3>
          <Button onClick={() => fetchDashboardData(false)} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-40 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 space-y-6 pb-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Platform overview and statistics</p>
            </div>
            <Button onClick={handleRefresh} size="sm" variant="outline" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>

          {/* Main Stats - Users & Posts */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <Card className="glass card-hover border-0 shadow-md bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-blue-950/20 dark:to-background/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{data?.platformStats?.totalUsers?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="glass card-hover border-0 shadow-md bg-gradient-to-br from-green-50/50 to-white/50 dark:from-green-950/20 dark:to-background/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold mt-1">{data?.platformStats?.activeUsers?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Posts */}
            <Card className="glass card-hover border-0 shadow-md bg-gradient-to-br from-purple-50/50 to-white/50 dark:from-purple-950/20 dark:to-background/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                    <p className="text-3xl font-bold mt-1">{data?.platformStats?.totalPosts?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="glass card-hover border-0 shadow-md bg-gradient-to-br from-amber-50/50 to-white/50 dark:from-amber-950/20 dark:to-background/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <p className="text-3xl font-bold mt-1">{data?.platformStats?.totalCategories || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>



          {/* Engagement Stats - Views, Likes, Comments */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Engagement Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Views */}
              <Card className="glass card-hover border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900/30">
                      <Eye className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Likes */}
              <Card className="glass card-hover border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30">
                      <Heart className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                      <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Comments */}
              <Card className="glass card-hover border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                      <MessageSquare className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Comments</p>
                      <p className="text-2xl font-bold">{totalComments.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Quick Stats Grid - Modern Cards */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* User Roles Quick View */}
            {data?.userDistribution && data.userDistribution.length > 0 && (
              <>
                {data.userDistribution.slice(0, 4).map((item, index) => {
                  const colors = [
                    { bg: 'from-red-500 to-rose-600', icon: 'bg-red-400/20' },
                    { bg: 'from-violet-500 to-purple-600', icon: 'bg-violet-400/20' },
                    { bg: 'from-blue-500 to-cyan-600', icon: 'bg-blue-400/20' },
                    { bg: 'from-emerald-500 to-teal-600', icon: 'bg-emerald-400/20' },
                  ];
                  const color = colors[index % colors.length];
                  return (
                    <Card key={item.role} className={`border-0 shadow-lg bg-gradient-to-br ${color.bg} text-white overflow-hidden relative`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/80 capitalize">{item.role}s</p>
                            <p className="text-3xl font-bold mt-1">{item.count}</p>
                          </div>
                          <div className={`p-3 rounded-xl ${color.icon}`}>
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </motion.div>

          {/* Post Status & Activity Row */}
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
            {/* Post Status - Horizontal Progress Bars */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Content Status
                </CardTitle>
                <CardDescription>Posts overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Published Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Published
                    </span>
                    <span className="text-sm font-bold text-green-600">{publishedPosts}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.platformStats?.totalPosts ? (publishedPosts / data.platformStats.totalPosts) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Pending Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Pending
                    </span>
                    <span className="text-sm font-bold text-amber-600">{pendingPosts}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.platformStats?.totalPosts ? (pendingPosts / data.platformStats.totalPosts) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Rejected Progress */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Rejected
                    </span>
                    <span className="text-sm font-bold text-red-600">{rejectedPosts}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.platformStats?.totalPosts ? (rejectedPosts / data.platformStats.totalPosts) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Posts</span>
                    <span className="text-xl font-bold">{data?.platformStats?.totalPosts || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Platform Activity
                </CardTitle>
                <CardDescription>Quick summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Active Rate */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Active Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {data?.platformStats?.totalUsers ? Math.round((data.platformStats.activeUsers / data.platformStats.totalUsers) * 100) : 0}%
                    </p>
                  </div>

                  {/* Approval Rate */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Approval Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {data?.platformStats?.totalPosts ? Math.round((publishedPosts / data.platformStats.totalPosts) * 100) : 0}%
                    </p>
                  </div>

                  {/* Categories */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Categories</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{data?.platformStats?.totalCategories || 0}</p>
                  </div>

                  {/* Engagement Score */}
                  <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-rose-600" />
                      <span className="text-xs text-muted-foreground">Engagement</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-600">{totalLikes + totalComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedAdminDashboard;
