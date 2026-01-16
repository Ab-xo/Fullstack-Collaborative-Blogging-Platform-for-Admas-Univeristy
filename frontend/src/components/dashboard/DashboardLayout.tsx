import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
  MobileSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Clock,
  XCircle,
  CheckCircle,
  Flag,
  MessageCircle,
  Activity,
  FolderOpen,
  Shield,
  Bell,
  UserCog,
  BookOpen,
  Inbox,
  History,
  Sliders,
  BarChart3,
  GraduationCap,
  PenTool,
  Feather,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'moderator' | 'author';
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const location = useLocation();
  const [pendingCount] = useState(12); // This would come from API
  const [reportedCount] = useState(3); // This would come from API

  // Admin Navigation Structure
  const adminNavGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          description: 'System overview and metrics'
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          description: 'Detailed analytics and reports'
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          title: 'All Users',
          href: '/admin/users',
          icon: Users,
          description: 'Manage user accounts'
        },
        {
          title: 'Roles & Permissions',
          href: '/admin/roles',
          icon: UserCog,
          description: 'Configure user permissions'
        },
      ],

    },
    {
      title: 'Content',
      items: [
        {
          title: 'Blog Moderation',
          href: '/admin/blog-moderation',
          icon: BookOpen,
          badge: pendingCount,
          description: 'Manage and moderate posts'
        },
        {
          title: 'Categories',
          href: '/admin/categories',
          icon: FolderOpen,
          description: 'Manage post categories'
        },
        {
          title: 'Programs',
          href: '/admin/programs',
          icon: GraduationCap,
          description: 'Manage academic programs'
        },
        {
          title: 'Messages',
          href: '/admin/contacts',
          icon: Inbox,
          description: 'Contact form submissions'
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Audit Logs',
          href: '/admin/audit-logs',
          icon: History,
          description: 'System activity logs'
        },
        {
          title: 'Settings',
          href: '/admin/settings',
          icon: Sliders,
          description: 'System configuration'
        },
      ],
    },
  ];

  // Moderator Navigation Structure
  const moderatorNavGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          href: '/moderator/dashboard',
          icon: LayoutDashboard,
          description: 'Moderation overview'
        },
      ],
    },
    {
      title: 'Content Review',
      items: [
        {
          title: 'Pending Queue',
          href: '/moderator/pending',
          icon: Clock,
          badge: pendingCount,
          description: 'Posts awaiting review'
        },
        {
          title: 'Rejected Posts',
          href: '/moderator/rejected',
          icon: XCircle,
          description: 'Previously rejected posts'
        },
        {
          title: 'Published Posts',
          href: '/moderator/published',
          icon: CheckCircle,
          description: 'Recently published posts'
        },
      ],
    },
    {
      title: 'Community Safety',
      items: [
        {
          title: 'Reported Content',
          href: '/moderator/reported',
          icon: Flag,
          badge: reportedCount,
          description: 'Flagged posts and comments'
        },
        {
          title: 'Comments',
          href: '/moderator/comments',
          icon: MessageCircle,
          description: 'Comment moderation'
        },
        {
          title: 'User Activity',
          href: '/moderator/users',
          icon: Activity,
          description: 'Monitor user behavior'
        },
      ],
    },
  ];

  // Author Navigation Structure
  const authorNavGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          href: '/author/dashboard',
          icon: BarChart3,
          description: 'Analytics and performance'
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          title: 'My Posts',
          href: '/my-posts',
          icon: BookOpen,
          description: 'Manage your posts'
        },
        {
          title: 'Create Post',
          href: '/posts/create',
          icon: PenTool,
          description: 'Write a new article'
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          href: '/profile',
          icon: UserCog,
          description: 'Manage your profile'
        },
      ],
    },
  ];

  const navGroups =
    userRole === 'admin' ? adminNavGroups :
      userRole === 'moderator' ? moderatorNavGroups :
        authorNavGroups;

  const SidebarComponent = () => (
    <Sidebar className="glass-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            userRole === 'author' 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
              : 'bg-primary'
          } text-primary-foreground`}>
            {userRole === 'author' ? (
              <Feather className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admas Blog</span>
            <span className="text-xs text-muted-foreground capitalize">
              {userRole === 'author' ? 'Author Studio' : `${userRole} Panel`}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav>
          {navGroups.map((group) => (
            <SidebarNavGroup key={group.title} title={group.title}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href}>
                    <SidebarNavItem
                      isActive={isActive}
                      icon={item.icon}
                      badge={item.badge}
                      className="cursor-pointer"
                    >
                      {item.title}
                    </SidebarNavItem>
                  </Link>
                );
              })}
            </SidebarNavGroup>
          ))}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarComponent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <MobileSidebar>
            <SidebarComponent />
          </MobileSidebar>
          <h1 className="text-lg font-semibold">Admas Blog</h1>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
