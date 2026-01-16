/**
 * ============================================================================
 * ANALYTICS DASHBOARD COMPONENT
 * ============================================================================
 * Industry-level analytics with beautiful charts and metrics
 * Shows REAL data only - no mock data when user has no posts
 */

import { useState, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
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
  RadialBarChart,
  RadialBar,
  CHART_COLORS,
} from "../ui/chart";
import {
  Eye,
  ThumbsUp,
  MessageSquare,
  FileText,
  ArrowUpRight,
  Activity,
  Target,
  Zap,
  Award,
  BarChart3,
  PenLine,
} from "lucide-react";
import { Link } from "react-router-dom";

// Empty State Component
const EmptyState = ({ title, description, actionLabel, actionLink }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
      <BarChart3 className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
      {description}
    </p>
    {actionLabel && actionLink && (
      <Link
        to={actionLink}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <PenLine className="w-4 h-4" />
        {actionLabel}
      </Link>
    )}
  </div>
);

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p
          className={`text-2xl font-bold mt-1 ${
            color || "text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
        <Icon className={`w-5 h-5 ${color || "text-blue-600"}`} />
      </div>
    </div>
  </div>
);

// Chart Card Wrapper
const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
  >
    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// Main Analytics Dashboard Component
const AnalyticsDashboard = ({ stats, recentPosts = [] }) => {
  // Check if user has any data
  const hasData = stats.postsCount > 0;
  const hasEngagement =
    (stats.totalViews || 0) +
      (stats.totalLikes || 0) +
      (stats.totalComments || 0) >
    0;

  // Post performance data - REAL data only
  const postPerformanceData = useMemo(() => {
    if (!recentPosts || recentPosts.length === 0) return [];
    return recentPosts.slice(0, 6).map((post) => ({
      name:
        post.title?.length > 25
          ? post.title.substring(0, 25) + "..."
          : post.title || "Untitled",
      views: post.views || 0,
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
    }));
  }, [recentPosts]);

  // Engagement breakdown data - REAL data only
  const engagementData = useMemo(() => {
    const total =
      (stats.totalLikes || 0) +
      (stats.totalDislikes || 0) +
      (stats.totalComments || 0);
    if (total === 0) return [];
    return [
      {
        name: "Likes",
        value: stats.totalLikes || 0,
        color: CHART_COLORS.success,
      },
      {
        name: "Dislikes",
        value: stats.totalDislikes || 0,
        color: CHART_COLORS.danger,
      },
      {
        name: "Comments",
        value: stats.totalComments || 0,
        color: CHART_COLORS.primary,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Content status data - REAL data only
  const contentStatusData = useMemo(() => {
    if (!hasData) return [];
    return [
      {
        name: "Published",
        value: stats.publishedCount || 0,
        fill: CHART_COLORS.success,
      },
      {
        name: "Drafts",
        value: stats.draftCount || 0,
        fill: CHART_COLORS.warning,
      },
      {
        name: "Pending",
        value: stats.pendingCount || 0,
        fill: CHART_COLORS.info,
      },
    ].filter((item) => item.value > 0);
  }, [stats, hasData]);

  // Calculate real metrics
  const avgViews =
    stats.postsCount > 0 ? Math.round(stats.totalViews / stats.postsCount) : 0;
  const avgLikes =
    stats.postsCount > 0
      ? (stats.totalLikes / stats.postsCount).toFixed(1)
      : "0";
  const approvalRate =
    (stats.totalLikes || 0) + (stats.totalDislikes || 0) > 0
      ? (
          (stats.totalLikes / (stats.totalLikes + stats.totalDislikes)) *
          100
        ).toFixed(0)
      : "0";
  const engagementRate =
    stats.totalViews > 0
      ? (
          (((stats.totalLikes || 0) + (stats.totalComments || 0)) /
            stats.totalViews) *
          100
        ).toFixed(1)
      : "0";

  // If no posts at all, show empty state
  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Analytics Overview
          </h2>
          <p className="text-gray-500 mt-1">
            Track your content performance and engagement
          </p>
        </div>

        {/* Empty Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <MetricCard
            title="Total Views"
            value="0"
            icon={Eye}
            color="text-blue-600"
          />
          <MetricCard
            title="Total Likes"
            value="0"
            icon={ThumbsUp}
            color="text-green-600"
          />
          <MetricCard
            title="Total Comments"
            value="0"
            icon={MessageSquare}
            color="text-purple-600"
          />
          <MetricCard
            title="Approval Rate"
            value="0%"
            icon={Target}
            color="text-pink-600"
          />
          <MetricCard
            title="Total Posts"
            value="0"
            subtitle="0 published"
            icon={FileText}
            color="text-indigo-600"
          />
        </div>

        {/* Empty State */}
        <ChartCard
          title="Your Analytics"
          subtitle="Start creating content to see your analytics"
        >
          <EmptyState
            title="No Posts Yet"
            description="Create your first post to start tracking your content performance, views, likes, and engagement metrics."
            actionLabel="Create Your First Post"
            actionLink="/posts/create"
          />
        </ChartCard>

        {/* Getting Started Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6" />
              <h3 className="font-semibold">Get Started</h3>
            </div>
            <p className="text-sm text-blue-100">
              Create your first blog post to start building your audience and
              tracking engagement.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6" />
              <h3 className="font-semibold">Set Goals</h3>
            </div>
            <p className="text-sm text-purple-100">
              Aim for your first 100 views! Consistent posting helps grow your
              readership.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6" />
              <h3 className="font-semibold">Earn Badges</h3>
            </div>
            <p className="text-sm text-green-100">
              Unlock achievements as you publish more content and engage with
              readers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User has posts - show real analytics
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-7 h-7 text-blue-600" />
          Analytics Overview
        </h2>
        <p className="text-gray-500 mt-1">
          Track your content performance and engagement
        </p>
      </div>

      {/* Key Metrics - REAL DATA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Total Views"
          value={(stats.totalViews || 0).toLocaleString()}
          icon={Eye}
          color="text-blue-600"
        />
        <MetricCard
          title="Total Likes"
          value={(stats.totalLikes || 0).toLocaleString()}
          icon={ThumbsUp}
          color="text-green-600"
        />
        <MetricCard
          title="Total Comments"
          value={(stats.totalComments || 0).toLocaleString()}
          icon={MessageSquare}
          color="text-purple-600"
        />
        <MetricCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon={Target}
          color="text-pink-600"
        />
        <MetricCard
          title="Total Posts"
          value={(stats.postsCount || 0).toString()}
          subtitle={`${stats.publishedCount || 0} published`}
          icon={FileText}
          color="text-indigo-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Performance - REAL DATA */}
        <ChartCard title="Post Performance" subtitle="Views and likes by post">
          {postPerformanceData.length > 0 ? (
            <ChartContainer className="h-[300px]">
              <BarChart data={postPerformanceData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  width={120}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="views"
                  fill={CHART_COLORS.primary}
                  radius={[0, 4, 4, 0]}
                  name="Views"
                />
                <Bar
                  dataKey="likes"
                  fill={CHART_COLORS.success}
                  radius={[0, 4, 4, 0]}
                  name="Likes"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState
              title="No Post Data"
              description="Your posts will appear here once they get views and engagement."
            />
          )}
        </ChartCard>

        {/* Engagement Breakdown - REAL DATA */}
        <ChartCard
          title="Engagement Breakdown"
          subtitle="Distribution of interactions"
        >
          {engagementData.length > 0 ? (
            <ChartContainer className="h-[300px]">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {payload?.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.value}: {engagementData[index]?.value || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <EmptyState
              title="No Engagement Yet"
              description="Likes, dislikes, and comments will appear here as readers interact with your posts."
            />
          )}
        </ChartCard>
      </div>

      {/* Content Status & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Status - REAL DATA */}
        <ChartCard title="Content Status" subtitle="Posts by status">
          {contentStatusData.length > 0 ? (
            <ChartContainer className="h-[250px]">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
                data={contentStatusData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                  content={({ payload }) => (
                    <div className="flex justify-center gap-4 mt-2">
                      {payload?.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.payload.fill }}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {entry.value}: {entry.payload.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </RadialBarChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No posts yet
            </div>
          )}
        </ChartCard>

        {/* Performance Metrics - REAL DATA */}
        <ChartCard
          title="Performance Metrics"
          subtitle="Key performance indicators"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Avg Views/Post",
                value: avgViews,
                color: CHART_COLORS.primary,
              },
              {
                name: "Avg Likes/Post",
                value: avgLikes,
                color: CHART_COLORS.success,
              },
              {
                name: "Approval Rate",
                value: `${approvalRate}%`,
                color: CHART_COLORS.secondary,
              },
              {
                name: "Engagement Rate",
                value: `${engagementRate}%`,
                color: CHART_COLORS.pink,
              },
            ].map((metric, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <p
                  className="text-3xl font-bold"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                  {metric.name}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Performing Posts Table - REAL DATA */}
      <ChartCard
        title="Top Performing Posts"
        subtitle="Your best content by engagement"
      >
        {recentPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Post Title
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Likes
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Comments
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.slice(0, 5).map((post, index) => {
                  const views = post.views || 0;
                  const likes = post.likesCount || 0;
                  const comments = post.commentsCount || 0;
                  const engagement =
                    views > 0
                      ? (((likes + comments) / views) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={post._id || index}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-[300px]">
                          {post.title || "Untitled Post"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : "No date"}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {views.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {likes.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <MessageSquare className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comments.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parseFloat(engagement) > 10
                              ? "bg-green-100 text-green-700"
                              : parseFloat(engagement) > 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {engagement}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Posts Yet"
            description="Your posts will appear here once you create them."
            actionLabel="Create Post"
            actionLink="/posts/create"
          />
        )}
      </ChartCard>

      {/* Insights Section - Based on REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6" />
            <h3 className="font-semibold">Performance</h3>
          </div>
          <p className="text-sm text-blue-100">
            {stats.totalViews > 0
              ? `Your posts have received ${stats.totalViews.toLocaleString()} total views. ${
                  stats.totalViews > 100
                    ? "Great job!"
                    : "Keep sharing your content!"
                }`
              : "Start promoting your posts to get more views!"}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6" />
            <h3 className="font-semibold">Goal Progress</h3>
          </div>
          <p className="text-sm text-purple-100">
            {stats.totalViews >= 1000
              ? "🎉 You've reached 1,000 views! Set a new goal!"
              : `${Math.min(
                  100,
                  Math.round((stats.totalViews / 1000) * 100)
                )}% towards 1,000 views goal. ${
                  1000 - stats.totalViews
                } more to go!`}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6" />
            <h3 className="font-semibold">Achievement</h3>
          </div>
          <p className="text-sm text-green-100">
            {stats.postsCount >= 10
              ? "🏆 Prolific Writer! 10+ posts published."
              : stats.postsCount >= 5
              ? "⭐ Active Creator! 5+ posts published."
              : stats.postsCount >= 1
              ? `📝 You've published ${stats.publishedCount || 0} post${
                  (stats.publishedCount || 0) !== 1 ? "s" : ""
                }. Keep writing!`
              : "Start your writing journey today!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
