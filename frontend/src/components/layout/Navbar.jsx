/**
 * ============================================================================
 * MAIN NAVIGATION BAR
 * ============================================================================
 *
 * The primary navigation component for the Admas University Blogging Platform.
 * Features a mega-menu style categories dropdown organized by groups.
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Code,
  Microscope,
  GraduationCap,
  Users,
  Calendar,
  Globe,
  Lightbulb,
  BookOpen,
  Briefcase,
  Trophy,
  Palette,
  Megaphone,
  FlaskConical,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { SITE_BRANDING } from "../../constants/branding";
import Avatar from "../common/Avatar";
import NotificationDropdown from "../notifications/NotificationDropdown";

/* ============================================================================
   CATEGORIES ORGANIZED BY GROUPS
   ============================================================================ */
const CATEGORY_GROUPS = [
  {
    title: "Academic",
    categories: [
      {
        name: "Academic",
        icon: GraduationCap,
        color: "text-blue-500",
        href: "/category/academic",
      },
      {
        name: "Research",
        icon: Microscope,
        color: "text-purple-500",
        href: "/category/research",
      },
      {
        name: "Thesis",
        icon: BookOpen,
        color: "text-indigo-500",
        href: "/category/thesis",
      },
      {
        name: "Tutorials",
        icon: Lightbulb,
        color: "text-yellow-500",
        href: "/category/tutorials",
      },
      {
        name: "Study Tips",
        icon: BookOpen,
        color: "text-cyan-500",
        href: "/category/study-tips",
      },
    ],
  },
  {
    title: "Campus",
    categories: [
      {
        name: "Campus Life",
        icon: Users,
        color: "text-orange-500",
        href: "/category/campus-life",
      },
      {
        name: "Events",
        icon: Calendar,
        color: "text-red-500",
        href: "/category/events",
      },
      {
        name: "Clubs",
        icon: Users,
        color: "text-pink-500",
        href: "/category/clubs",
      },
      {
        name: "Sports",
        icon: Trophy,
        color: "text-green-500",
        href: "/category/sports",
      },
      {
        name: "Alumni",
        icon: GraduationCap,
        color: "text-lime-500",
        href: "/category/alumni",
      },
    ],
  },
  {
    title: "Tech & Science",
    categories: [
      {
        name: "Technology",
        icon: Code,
        color: "text-cyan-500",
        href: "/category/technology",
      },
      {
        name: "Innovation",
        icon: Lightbulb,
        color: "text-amber-500",
        href: "/category/innovation",
      },
      {
        name: "Engineering",
        icon: Wrench,
        color: "text-slate-500",
        href: "/category/engineering",
      },
      {
        name: "Science",
        icon: FlaskConical,
        color: "text-emerald-500",
        href: "/category/science",
      },
      {
        name: "Health",
        icon: FlaskConical,
        color: "text-red-400",
        href: "/category/health",
      },
    ],
  },
  {
    title: "Arts & Culture",
    categories: [
      {
        name: "Culture",
        icon: Globe,
        color: "text-teal-500",
        href: "/category/culture",
      },
      {
        name: "Arts",
        icon: Palette,
        color: "text-rose-500",
        href: "/category/arts",
      },
      {
        name: "Literature",
        icon: BookOpen,
        color: "text-violet-500",
        href: "/category/literature",
      },
      {
        name: "Music",
        icon: Palette,
        color: "text-fuchsia-500",
        href: "/category/music",
      },
      {
        name: "Photography",
        icon: Palette,
        color: "text-sky-500",
        href: "/category/photography",
      },
    ],
  },
  {
    title: "Career & Life",
    categories: [
      {
        name: "Career",
        icon: Briefcase,
        color: "text-sky-500",
        href: "/category/career",
      },
      {
        name: "Internships",
        icon: Briefcase,
        color: "text-blue-400",
        href: "/category/internships",
      },
      {
        name: "Opinion",
        icon: Megaphone,
        color: "text-fuchsia-500",
        href: "/category/opinion",
      },
      {
        name: "News",
        icon: Megaphone,
        color: "text-red-600",
        href: "/category/announcements",
      },
      {
        name: "Other",
        icon: Globe,
        color: "text-gray-500",
        href: "/category/other",
      },
    ],
  },
];

// Flat list for mobile - all 25 categories
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.categories);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const categoriesRef = useRef(null);

  // Use centralized branding
  const mainTitle = SITE_BRANDING.mainTitle;
  const subTitle = SITE_BRANDING.subTitle;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    // Redirect to introduction page after logout
    navigate("/");
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-cyan-500 group-hover:w-4/5 group-hover:left-[10%] transition-all duration-300 ease-out rounded-full" />
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/assets/logo/admas-logo.png"
                alt="Admas University"
                className="w-11 h-11 rounded-full bg-white p-0.5 shadow-sm"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight">
                  {mainTitle}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {subTitle}
                </span>
              </div>
              <span className="sm:hidden text-lg font-bold text-gray-900 dark:text-white">
                CBP
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          {!isMobile && (
            <div className="flex items-center space-x-1">
              <NavLink to="/home">Home</NavLink>
              <NavLink to="/blogs">Blogs</NavLink>
              {isAuthenticated && <NavLink to="/feed">Feed</NavLink>}

              {/* Categories Mega Menu */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="relative flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      categoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-cyan-500 group-hover:w-4/5 group-hover:left-[10%] transition-all duration-300 ease-out rounded-full" />
                </button>

                {/* Mega Menu Dropdown - Aligned Grid */}
                {categoriesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-50 min-w-[640px]">
                    {/* Column Headers */}
                    <div className="grid grid-cols-5 gap-4 mb-3">
                      {CATEGORY_GROUPS.map((group) => (
                        <h4
                          key={group.title}
                          className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                        >
                          {group.title}
                        </h4>
                      ))}
                    </div>

                    {/* Category Rows - Each row aligns across all columns */}
                    {[0, 1, 2, 3, 4].map((rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-5 gap-4">
                        {CATEGORY_GROUPS.map((group) => {
                          const cat = group.categories[rowIndex];
                          if (!cat) return <div key={group.title + rowIndex} />;
                          const Icon = cat.icon;
                          return (
                            <Link
                              key={cat.name}
                              to={cat.href}
                              onClick={() => setCategoriesOpen(false)}
                              className="flex items-center space-x-2 py-2 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <Icon
                                className={`w-4 h-4 flex-shrink-0 ${cat.color}`}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white whitespace-nowrap">
                                {cat.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ))}

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end">
                      <Link
                        to="/categories"
                        onClick={() => setCategoriesOpen(false)}
                        className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                      >
                        View All Categories →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>

              {isAuthenticated ? (
                <>
                  {user?.roles?.includes("admin") && (
                    <NavLink to="/admin">Admin</NavLink>
                  )}
                  {user?.roles?.includes("moderator") &&
                    !user?.roles?.includes("admin") && (
                      <NavLink to="/moderator">Moderator</NavLink>
                    )}
                  {!user?.roles?.includes("admin") &&
                    !user?.roles?.includes("moderator") && (
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    )}

                  <button
                    onClick={toggleTheme}
                    className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="relative w-5 h-5">
                      {effectiveTheme === "dark" ? (
                        <Sun className="w-5 h-5 text-amber-500 transform transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-500 transform transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                      )}
                    </div>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>

                  <NotificationDropdown />

                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Avatar
                        src={user?.profile?.avatar}
                        alt={user?.email}
                        fallback={user?.email}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                        {user?.firstName || user?.email?.split("@")[0]}
                      </span>
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="w-4 h-4 mr-2" /> Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleTheme}
                    className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="relative w-5 h-5">
                      {effectiveTheme === "dark" ? (
                        <Sun className="w-5 h-5 text-amber-500 transform transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-500 transform transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                      )}
                    </div>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  <NavLink to="/login">Login</NavLink>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group overflow-hidden"
              >
                <div className="relative w-5 h-5">
                  {effectiveTheme === "dark" ? (
                    <Sun className="w-5 h-5 text-amber-500 transform transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-500 transform transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                  )}
                </div>
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              {isAuthenticated && <NotificationDropdown />}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Blogs
            </Link>

            {/* Mobile Categories - Collapsible */}
            <div className="py-2">
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  Categories
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    mobileCategoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileCategoriesOpen && (
                <>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {ALL_CATEGORIES.slice(0, 15).map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Link
                          key={cat.name}
                          to={cat.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Icon className={`w-5 h-5 ${cat.color}`} />
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                            {cat.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    to="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-xs text-primary-600 mt-2"
                  >
                    View All {ALL_CATEGORIES.length} Categories →
                  </Link>
                </>
              )}
            </div>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                {user?.roles?.includes("admin") && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Admin
                  </Link>
                )}
                {user?.roles?.includes("moderator") &&
                  !user?.roles?.includes("admin") && (
                    <Link
                      to="/moderator"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Moderator
                    </Link>
                  )}
                {!user?.roles?.includes("admin") &&
                  !user?.roles?.includes("moderator") && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Dashboard
                    </Link>
                  )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-primary-600 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
