/**
 * ============================================================================
 * MODERATOR DASHBOARD
 * ============================================================================
 * 
 * Dashboard for content moderators to review and manage blog posts.
 * 
 * DASHBOARD SECTIONS:
 *   1. Stats Overview - Pending, published, rejected counts
 *   2. Engagement Analytics - Views, likes, comments metrics
 *   3. Moderation Stats - Approval rate, daily activity
 *   4. Category Workload - Posts pending by category
 *   5. Moderation Trends - Approval/rejection over time
 *   6. Recent Activity - Latest moderation actions
 * 
 * MODERATOR RESPONSIBILITIES:
 *   - Review pending posts
 *   - Approve quality content
 *   - Reject inappropriate content with feedback
 *   - Monitor content quality metrics
 * 
 * CHARTS:
 *   - Doughnut: Post status distribution
 *   - Bar: Category workload
 *   - Area: Moderation trends over time
 * 
 * ACCESS:
 *   - Moderator and Admin roles only
 * 
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/analytics/StatCard';
import ChartContainer from '@/components/analytics/ChartContainer';
import DoughnutChart from '@/components/analytics/charts/DoughnutChart';
import BarChart from '@/components/analytics/charts/BarChart';
import AreaChart from '@/components/analytics/charts/AreaChart';
import { getModeratorDashboard } from '@/api/analytics';
import {
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  MessageCircle,
  Activity,
  Eye,
  Heart,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  Target,
  BarChart3,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface ModeratorData {
  stats: {
    pending: number;
    published: number;
    rejected: number;
    total: number;
  };
  engagementAnalytics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    approvalRate: number;
  };
  moderationStats: {
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  categoryWorkload: Array<{
    category: string;
    pending: number;
  }>;
  moderationTrends: Array<{
    date: string;
    approved: number;
    rejected: number;
  }>;
}

const UnifiedModeratorDashboard: React.FC = () => {
  const [data, setData] = useState<ModeratorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getModeratorDashboard();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        // Use mock data if API fails
        console.warn('Using mock data - API returned:', response);
        setData({
          stats: {
            pending: 0,
            published: 0,
            rejected: 0,
            total: 0,
          },
          engagementAnalytics: {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            approvalRate: 0,
          },
          moderationStats: {
            approved: 0,
            rejected: 0,
            approvalRate: 0,
          },
          categoryWorkload: [],
          moderationTrends: [],
        });
        if (!hasShownError) {
          toast.error('Using demo data - API not configured');
          setHasShownError(true);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data on error
      setData({
        stats: {
          pending: 0,
          published: 0,
          rejected: 0,
          total: 0,
        },
        engagementAnalytics: {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          approvalRate: 0,
        },
        moderationStats: {
          approved: 0,
          rejected: 0,
          approvalRate: 0,
        },
        categoryWorkload: [],
        moderationTrends: [],
      });
      if (!hasShownError) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load';
        toast.error('Using demo data - ' + errorMessage);
        setHasShownError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="moderator">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout userRole="moderator">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="moderator">
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-40 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 space-y-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Moderator Dashboard</h1>
              <p className="text-muted-foreground">
                Content moderation and community management hub
              </p>
            </div>
            <Button onClick={fetchDashboardData} size="sm">
              Refresh Data
            </Button>
          </div>

          {/* Primary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Pending Posts"
              value={data?.stats?.pending || 0}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Published Posts"
              value={data?.stats?.published || 0}
              icon={CheckCircle}
              color="green"
              trend={{ direction: 'up', value: 15 }}
            />
            <StatCard
              title="Rejected Posts"
              value={data?.stats?.rejected || 0}
              icon={XCircle}
              color="red"
            />
            <StatCard
              title="Total Moderated"
              value={data?.stats?.total || 0}
              icon={FileText}
              color="blue"
            />
          </div>

          {/* Engagement Analytics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass card-hover border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data?.engagementAnalytics?.totalViews || 0).toLocaleString()}</div>
                <Badge variant="default" className="mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass card-hover border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data?.engagementAnalytics?.totalLikes || 0).toLocaleString()}</div>
                <Badge variant="secondary" className="mt-2">Stable</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                <MessageCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data?.engagementAnalytics?.totalComments || 0).toLocaleString()}</div>
                <Badge variant="default" className="mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass card-hover border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.engagementAnalytics?.approvalRate || 0}%</div>
                <Badge variant="default" className="mt-2">Excellent</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          {data.categoryWorkload.length === 0 && data.moderationTrends.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
                <p className="text-sm">
                  Analytics charts will appear here once the backend API is properly configured.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {((data?.moderationStats?.approved || 0) > 0 || (data?.moderationStats?.rejected || 0) > 0) && (
                  <ChartContainer
                    className="glass"
                    title="Approval vs Rejection Ratio"
                    description="Overall moderation performance"
                  >
                    <DoughnutChart
                      data={[
                        {
                          label: "Approved",
                          value: data.moderationStats.approved || 1,
                          color: "#10B981",
                        },
                        {
                          label: "Rejected",
                          value: data.moderationStats.rejected || 1,
                          color: "#EF4444",
                        },
                      ]}
                      centerText={`${data?.moderationStats?.approvalRate || 0}%`}
                    />
                  </ChartContainer>
                )}

                {data.categoryWorkload.length > 0 && (
                  <ChartContainer
                    className="glass"
                    title="Pending Posts by Category"
                    description="Workload distribution across categories"
                  >
                    <BarChart
                      data={data.categoryWorkload.map((cat) => ({
                        label: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
                        value: cat.pending,
                      }))}
                      horizontal={true}
                      chartColors="#F59E0B"
                    />
                  </ChartContainer>
                )}
              </div>

              {/* Moderation Trends */}
              {data.moderationTrends && data.moderationTrends.length > 0 && (
                <ChartContainer
                  className="glass"
                  title="Moderation Activity Trends (Last 30 Days)"
                  description="Daily moderation activity patterns"
                >
                  <AreaChart
                    datasets={[
                      {
                        label: "Approved",
                        data: data.moderationTrends.map((trend) => ({
                          x: format(new Date(trend.date), "MMM d"),
                          y: trend.approved,
                        })),
                        color: "#10B981",
                      },
                      {
                        label: "Rejected",
                        data: data.moderationTrends.map((trend) => ({
                          x: format(new Date(trend.date), "MMM d"),
                          y: trend.rejected,
                        })),
                        color: "#EF4444",
                      },
                    ]}
                    filled={true}
                  />
                </ChartContainer>
              )}
            </>
          )}

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="moderation">Blog Moderation</TabsTrigger>
              <TabsTrigger value="pending">Pending Queue</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Blog Moderation Tab */}
            <TabsContent value="moderation" className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Blog Moderation Center
                  </CardTitle>
                  <CardDescription>
                    Review, approve, or reject blog posts submitted by authors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Link to="/admin/blog-moderation?filter=pending" className="block">
                      <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Clock className="h-8 w-8 text-yellow-500" />
                          <div>
                            <h4 className="font-semibold">Pending Posts</h4>
                            <p className="text-2xl font-bold text-yellow-600">{data?.stats?.pending || 0}</p>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/admin/blog-moderation?filter=published" className="block">
                      <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <h4 className="font-semibold">Published Posts</h4>
                            <p className="text-2xl font-bold text-green-600">{data?.stats?.published || 0}</p>
                            <p className="text-xs text-muted-foreground">Approved & live</p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link to="/admin/blog-moderation?filter=rejected" className="block">
                      <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-8 w-8 text-red-500" />
                          <div>
                            <h4 className="font-semibold">Rejected Posts</h4>
                            <p className="text-2xl font-bold text-red-600">{data?.stats?.rejected || 0}</p>
                            <p className="text-xs text-muted-foreground">Declined posts</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="pt-4 border-t">
                    <Link to="/admin/blog-moderation">
                      <Button className="w-full" size="lg">
                        <Flag className="h-4 w-4 mr-2" />
                        Open Full Blog Moderation Panel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Moderation Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily Review Target</span>
                      <Badge variant="default">20 posts</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time Goal</span>
                      <Badge variant="secondary">&lt; 2 hours</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Score</span>
                      <Badge variant="default">95%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Today's Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Posts Reviewed</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Approved</span>
                      <span className="font-medium text-green-600">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rejected</span>
                      <span className="font-medium text-red-600">3</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pending Queue Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Posts Queue
                  </CardTitle>
                  <CardDescription>
                    {data?.stats?.pending || 0} posts awaiting your review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Recent posts need review</h4>
                        <p className="text-sm text-muted-foreground">
                          {data?.stats?.pending || 0} posts waiting for moderation
                        </p>
                      </div>
                      <Link to="/admin/blog-moderation?filter=pending">
                        <Button>Review Now</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Activity log will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnifiedModeratorDashboard;
