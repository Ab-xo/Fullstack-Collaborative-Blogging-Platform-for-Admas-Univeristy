import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isActive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title: string;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col border-r bg-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-16 items-center border-b px-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollArea className="flex-1">
        <div
          ref={ref}
          className={cn("flex flex-col gap-2 p-4", className)}
          {...props}
        >
          {children}
        </div>
      </ScrollArea>
    );
  }
);
SidebarContent.displayName = "SidebarContent";

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      >
        {children}
      </nav>
    );
  }
);
SidebarNav.displayName = "SidebarNav";

const SidebarNavGroup = React.forwardRef<HTMLDivElement, SidebarNavGroupProps>(
  ({ className, children, title, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-4", className)} {...props}>
        <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
          {title}
        </h4>
        <div className="space-y-1">{children}</div>
      </div>
    );
  }
);
SidebarNavGroup.displayName = "SidebarNavGroup";

const SidebarNavItem = React.forwardRef<HTMLDivElement, SidebarNavItemProps>(
  ({ className, children, isActive, icon: Icon, badge, ...props }, ref) => {
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 h-9",
          isActive && "bg-secondary",
          className
        )}
        asChild
      >
        <div ref={ref} {...props}>
          {Icon && <Icon className="h-4 w-4" />}
          <span className="flex-1 text-left">{children}</span>
          {badge && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {badge}
            </span>
          )}
        </div>
      </Button>
    );
  }
);
SidebarNavItem.displayName = "SidebarNavItem";

// Mobile Sidebar
interface MobileSidebarProps {
  children: React.ReactNode;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        {children}
      </SheetContent>
    </Sheet>
  );
};

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
  MobileSidebar,
};
