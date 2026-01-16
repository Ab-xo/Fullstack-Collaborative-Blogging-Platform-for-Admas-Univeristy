import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";
import ModeratorRoute from "./ModeratorRoute";
import AuthorRoute from "./AuthorRoute";
import { useAuth } from "../hooks/useAuth";

// Direct import for auth pages to avoid lazy loading issues
import Login from "../pages/Login";
import Register from "../pages/Register";

// Lazy load pages for code splitting
const Introduction = lazy(() => import("../pages/Introduction"));
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const CompleteGoogleProfile = lazy(() =>
  import("../pages/CompleteGoogleProfile")
);
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const Settings = lazy(() => import("../pages/Settings"));
const PendingUsers = lazy(() => import("../pages/admin/PendingUsers"));
const PendingAuthors = lazy(() => import("../pages/admin/PendingAuthors"));
const RejectedUsers = lazy(() => import("../pages/admin/RejectedUsers"));
const AllUsers = lazy(() => import("../pages/admin/AllUsers"));
const Statistics = lazy(() => import("../pages/admin/Statistics"));
const BlogModeration = lazy(() => import("../pages/admin/BlogModeration"));
const ContactMessages = lazy(() => import("../pages/admin/ContactMessages"));
const UnifiedAdminDashboard = lazy(() =>
  import("../pages/admin/UnifiedAdminDashboard")
);
const AdminAnalyticsPage = lazy(() =>
  import("../pages/admin/AdminAnalyticsPage")
);
const RolesPermissions = lazy(() =>
  import("../pages/admin/RolesPermissions.jsx")
);
const Categories = lazy(() => import("../pages/admin/Categories.jsx"));
const AuditLogs = lazy(() => import("../pages/admin/AuditLogs"));
const SystemSettings = lazy(() => import("../pages/admin/SystemSettings"));
const Programs = lazy(() => import("../pages/admin/Programs"));
const UnifiedModeratorDashboard = lazy(() =>
  import("../pages/moderator/UnifiedModeratorDashboard")
);
// Moderator pages
const PendingQueue = lazy(() => import("../pages/moderator/PendingQueue"));
const RejectedPosts = lazy(() => import("../pages/moderator/RejectedPosts"));
const PublishedPosts = lazy(() => import("../pages/moderator/PublishedPosts"));
const ReportedContent = lazy(() =>
  import("../pages/moderator/ReportedContent")
);
const ModeratorComments = lazy(() => import("../pages/moderator/Comments"));
const UserActivity = lazy(() => import("../pages/moderator/UserActivity"));
const AuthorDashboard = lazy(() => import("../pages/author/AuthorDashboard"));
const FollowingFeed = lazy(() => import("../pages/FollowingFeed"));
const BlogPage = lazy(() => import("../pages/posts/BlogPage"));
const CategoriesIndex = lazy(() =>
  import("../pages/categories/CategoriesIndex")
);
const CategoryPage = lazy(() => import("../pages/categories/CategoryPage"));
const PostDetail = lazy(() => import("../pages/posts/PostDetail"));
const CreatePost = lazy(() => import("../pages/posts/CreatePost"));
const EditPost = lazy(() => import("../pages/posts/EditPost"));
const MyPosts = lazy(() => import("../pages/posts/MyPosts"));
const Notifications = lazy(() => import("../pages/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Unsubscribe = lazy(() => import("../pages/Unsubscribe"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const Maintenance = lazy(() => import("../pages/Maintenance"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

// Smart Root Route - redirects based on auth status
const RootRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  // Logged-in users go to home, guests see introduction
  return isAuthenticated ? <Navigate to="/home" replace /> : <Introduction />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Smart Landing Page - redirects logged-in users to home */}
        <Route path="/" element={<RootRoute />} />

        {/* Main Platform Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Guest-Only Routes - Redirect authenticated users to home */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        {/* Password Reset Routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route
          path="/complete-google-profile"
          element={<CompleteGoogleProfile />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Blog Routes */}
        <Route path="/blogs" element={<BlogPage />} />
        {/* Redirect /posts to /blogs for unified experience */}
        <Route path="/posts" element={<Navigate to="/blogs" replace />} />

        {/* Following Feed Route */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FollowingFeed />
            </ProtectedRoute>
          }
        />

        {/* Category Routes */}
        <Route path="/categories" element={<CategoriesIndex />} />
        <Route path="/category/:slug" element={<CategoryPage />} />

        {/* Post detail is public - guests can view but need login for likes/comments */}
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route
          path="/posts/create"
          element={
            <AuthorRoute>
              <CreatePost />
            </AuthorRoute>
          }
        />
        <Route
          path="/posts/edit/:id"
          element={
            <AuthorRoute>
              <EditPost />
            </AuthorRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <AuthorRoute>
              <EditPost />
            </AuthorRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <AuthorRoute>
              <MyPosts />
            </AuthorRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <UnifiedAdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <AdminRoute>
              <PendingUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/authors/pending"
          element={
            <AdminRoute>
              <PendingAuthors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/rejected"
          element={
            <AdminRoute>
              <RejectedUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AllUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <AdminRoute>
              <Statistics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <AdminRoute>
              <RolesPermissions />
            </AdminRoute>
          }
        />
        {/* Redirect /admin/posts to /admin/blog-moderation */}
        <Route
          path="/admin/posts"
          element={<Navigate to="/admin/blog-moderation" replace />}
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <Categories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/blog-moderation"
          element={
            <AdminRoute>
              <BlogModeration />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <AdminRoute>
              <ContactMessages />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AuditLogs />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <SystemSettings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <AdminRoute>
              <Programs />
            </AdminRoute>
          }
        />

        {/* Moderator Dashboard */}
        <Route
          path="/moderator"
          element={
            <ModeratorRoute>
              <UnifiedModeratorDashboard />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/dashboard"
          element={
            <ModeratorRoute>
              <UnifiedModeratorDashboard />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/pending"
          element={
            <ModeratorRoute>
              <PendingQueue />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/rejected"
          element={
            <ModeratorRoute>
              <RejectedPosts />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/published"
          element={
            <ModeratorRoute>
              <PublishedPosts />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/reported"
          element={
            <ModeratorRoute>
              <ReportedContent />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/comments"
          element={
            <ModeratorRoute>
              <ModeratorComments />
            </ModeratorRoute>
          }
        />
        <Route
          path="/moderator/users"
          element={
            <ModeratorRoute>
              <UserActivity />
            </ModeratorRoute>
          }
        />

        {/* Admin Dashboard & Analytics */}
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <UnifiedAdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/author/dashboard"
          element={
            <AuthorRoute>
              <AuthorDashboard />
            </AuthorRoute>
          }
        />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
