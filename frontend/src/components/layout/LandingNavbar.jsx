import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { SITE_BRANDING } from "../../constants/branding";

const LandingNavbar = () => {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={SITE_BRANDING.logoPath}
                alt={SITE_BRANDING.subTitle}
                className="w-10 h-10 rounded-full bg-white p-1"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight">
                  {SITE_BRANDING.mainTitle}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {SITE_BRANDING.subTitle}
                </span>
              </div>
              <span className="sm:hidden text-lg font-bold text-gray-900 dark:text-white">
                {SITE_BRANDING.shortName}
              </span>
            </Link>
          </div>

          {/* Right Side - Theme Toggle & Login */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {effectiveTheme === "dark" ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Login Button - For returning users */}
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Login
            </Link>

            {/* Sign Up Button - Primary CTA */}
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105 transform"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
