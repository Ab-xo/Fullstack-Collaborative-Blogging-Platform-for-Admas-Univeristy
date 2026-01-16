/**
 * ============================================================================
 * AUTHOR DASHBOARD - CONTENT CREATOR ANALYTICS
 * ============================================================================
 *
 * Purpose:
 *   Provides authors with comprehensive analytics and insights about
 *   their published content, engagement metrics, and audience reach.
 *
 * Features:
 *   - Post statistics (total, published, pending, rejected)
 *   - Engagement metrics (views, likes, comments)
 *   - Visual charts (Pie, Bar, Line, Radar)
 *   - Post status breakdown
 *   - Trending content analysis
 *   - Time-based performance tracking
 *
 * Charts Included:
 *   - Post status distribution (Pie Chart)
 *   - Views over time (Line Chart)
 *   - Category performance (Bar Chart)
 *   - Engagement radar (Radar Chart)
 *
 * Data Source:
 *   - getAuthorDashboard API endpoint
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { getAuthorDashboard } from "../../api/analytics";
import {
  FileText,
  Eye,
  Heart,
  MessageCircle,
  CheckCircle,
  Clock,
  Edit,
  RefreshCw,
  Zap,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { Button } from "../../components/ui/button";
import StatCard from "../../components/analytics/StatCard";
import ChartContainer from "../../components/analytics/ChartContainer";
import PieChart from "../../components/analytics/charts/PieChart";
import BarChart from "../../components/analytics/charts/BarChart";
import LineChart from "../../components/analytics/charts/LineChart";
import RadarChart from "../../components/analytics/charts/RadarChart";
import toast from "react-hot-toast";
import { format } from "date-fns";

const AuthorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showToast = false) => {
    try {
      if (!data) setLoading(true);
      setError(null);

      const response = await getAuthorDashboard();

      if (response.success && response.data) {
        setData(response.data);
        if (showToast) toast.success("Dashboard updated");
      } else {
        setError("Invalid response from server");
        if (!data) toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard data";
      setError(errorMessage);
      if (!data) toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
  };

  if (loading) {
    return (
      <DashboardLayout userRole="author">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Zap className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground font-medium">
              Loading your analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout userRole="author">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchDashboardData(false)} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout userRole="author">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <Button onClick={() => fetchDashboardData(false)} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="author">
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-40 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                Author Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track your content performance and engagement
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Author Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Posts"
              value={data?.authorStats?.totalPosts || 0}
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Published"
              value={data?.authorStats?.published || 0}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Total Views"
              value={data?.authorStats?.totalViews || 0}
              icon={Eye}
              color="purple"
            />
            <StatCard
              title="Total Comments"
              value={data?.authorStats?.totalComments || 0}
              icon={MessageCircle}
              color="yellow"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Pending Review"
              value={data?.authorStats?.pending || 0}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Total Likes"
              value={data?.authorStats?.totalLikes || 0}
              icon={Heart}
              color="pink"
            />
            <StatCard
              title="Drafts"
              value={data?.authorStats?.draft || 0}
              icon={Edit}
              color="blue"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Post Status Distribution */}
            {data?.statusDistribution && data.statusDistribution.length > 0 && (
              <ChartContainer title="Post Status Distribution">
                <PieChart
                  data={data.statusDistribution.map((item) => ({
                    label:
                      item.status.charAt(0).toUpperCase() +
                      item.status.slice(1),
                    value: item.count,
                  }))}
                />
              </ChartContainer>
            )}

            {/* Category Distribution Radar */}
            {data?.categoryDistribution &&
              data.categoryDistribution.length > 0 && (
                <ChartContainer title="Posts by Category">
                  <RadarChart
                    data={data.categoryDistribution.map((cat) => ({
                      axis:
                        cat.category.charAt(0).toUpperCase() +
                        cat.category.slice(1),
                      value: cat.count,
                    }))}
                  />
                </ChartContainer>
              )}
          </div>

          {/* Top Performing Posts */}
          {data?.postPerformance && data.postPerformance.length > 0 && (
            <div className="mb-8">
              <ChartContainer title="Top Performing Posts (by Views)">
                <BarChart
                  data={data.postPerformance.slice(0, 10).map((post) => ({
                    label:
                      post.title.length > 30
                        ? post.title.substring(0, 30) + "..."
                        : post.title,
                    value: post.views || 0,
                  }))}
                  horizontal={true}
                />
              </ChartContainer>
            </div>
          )}

          {/* Engagement Trends */}
          {data?.engagementTrends && data.engagementTrends.length > 0 && (
            <div className="mb-8">
              <ChartContainer title="Engagement Trends (Last 30 Days)">
                <LineChart
                  datasets={[
                    {
                      label: "Views",
                      data: data.engagementTrends.map((trend) => ({
                        x: format(new Date(trend.date), "MMM d"),
                        y: trend.views || 0,
                      })),
                      color: "#3B82F6",
                    },
                    {
                      label: "Comments",
                      data: data.engagementTrends.map((trend) => ({
                        x: format(new Date(trend.date), "MMM d"),
                        y: trend.comments || 0,
                      })),
                      color: "#10B981",
                    },
                    {
                      label: "Likes",
                      data: data.engagementTrends.map((trend) => ({
                        x: format(new Date(trend.date), "MMM d"),
                        y: trend.likes || 0,
                      })),
                      color: "#EC4899",
                    },
                  ]}
                />
              </ChartContainer>
            </div>
          )}

          {/* Publishing Activity */}
          {data?.publishingActivity && data.publishingActivity.length > 0 && (
            <div className="mb-8">
              <ChartContainer title="Publishing Activity (Last 12 Months)">
                <BarChart
                  data={data.publishingActivity.map((activity) => ({
                    label: `${activity.month}/${activity.year}`,
                    value: activity.count || 0,
                  }))}
                />
              </ChartContainer>
            </div>
          )}

          {/* Empty State */}
          {data?.authorStats?.totalPosts === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <FileText className="w-20 h-20 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                No Posts Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                Start creating content to see your analytics and performance
                metrics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuthorDashboard;
