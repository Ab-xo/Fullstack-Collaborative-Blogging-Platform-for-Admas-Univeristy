/**
 * ============================================================================
 * ADMIN ANALYTICS DASHBOARD
 * ============================================================================
 * Deep analytics with detailed charts - distinct from main dashboard
 */

import { useState, useEffect } from "react";
import { getAdminDashboard } from "../../api/analytics";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { format } from "date-fns";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import BlogEngagementSection from "../../components/admin/BlogEngagementSection";

const AdminAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading analytics..." />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate totals
  const totalViews =
    data?.engagementTrends?.reduce((sum, t) => sum + (t.views || 0), 0) || 0;
  const totalLikes =
    data?.engagementTrends?.reduce((sum, t) => sum + (t.likes || 0), 0) || 0;
  const totalComments =
    data?.engagementTrends?.reduce((sum, t) => sum + (t.comments || 0), 0) || 0;

  // Chart colors
  const chartColors = {
    primary: ["#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899"],
    secondary: ["#06B6D4", "#14B8A6", "#10B981", "#22C55E", "#84CC16"],
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed platform insights and trends
          </p>
        </div>

        {/* Engagement Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Views</p>
                <p className="text-2xl font-bold">
                  {totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Likes</p>
                <p className="text-2xl font-bold">
                  {totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Comments</p>
                <p className="text-2xl font-bold">
                  {totalComments.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution - Doughnut Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              User Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              {data?.userDistribution && data.userDistribution.length > 0 ? (
                <Doughnut
                  data={{
                    labels: data.userDistribution.map(
                      (u) => u.role.charAt(0).toUpperCase() + u.role.slice(1)
                    ),
                    datasets: [
                      {
                        data: data.userDistribution.map((u) => u.count),
                        backgroundColor: chartColors.primary,
                        borderWidth: 0,
                        cutout: "60%",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: { padding: 15, usePointStyle: true },
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </div>

          {/* Post Status - Horizontal Bar Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Post Status Breakdown
            </h3>
            <div className="h-64">
              {data?.postStatusDistribution &&
              data.postStatusDistribution.length > 0 ? (
                <Bar
                  data={{
                    labels: data.postStatusDistribution.map(
                      (p) =>
                        p.status.charAt(0).toUpperCase() + p.status.slice(1)
                    ),
                    datasets: [
                      {
                        label: "Posts",
                        data: data.postStatusDistribution.map((p) => p.count),
                        backgroundColor: [
                          "#22C55E",
                          "#F59E0B",
                          "#6366F1",
                          "#EF4444",
                        ],
                        borderRadius: 8,
                        barThickness: 40,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { display: false } },
                    },
                  }}
                />
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Engagement Trends - Line Chart */}
        {data?.engagementTrends && data.engagementTrends.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Engagement Trends
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: data.engagementTrends.map((t) =>
                    format(new Date(t.date), "MMM d")
                  ),
                  datasets: [
                    {
                      label: "Views",
                      data: data.engagementTrends.map((t) => t.views),
                      borderColor: "#3B82F6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Likes",
                      data: data.engagementTrends.map((t) => t.likes),
                      borderColor: "#EC4899",
                      backgroundColor: "rgba(236, 72, 153, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                    {
                      label: "Comments",
                      data: data.engagementTrends.map((t) => t.comments),
                      borderColor: "#10B981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: { usePointStyle: true, padding: 20 },
                    },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Top Categories - Vertical Bar Chart */}
        {data?.topCategories && data.topCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Top Categories
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: data.topCategories
                    .slice(0, 8)
                    .map(
                      (c) =>
                        c.category.charAt(0).toUpperCase() + c.category.slice(1)
                    ),
                  datasets: [
                    {
                      label: "Posts",
                      data: data.topCategories.slice(0, 8).map((c) => c.count),
                      backgroundColor: chartColors.secondary,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Blog Engagement - Top Viewed & Liked Posts */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Blog Engagement
          </h3>
          <BlogEngagementSection />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsDashboard;
