/**
 * ============================================================================
 * 404 NOT FOUND PAGE - ERROR HANDLING
 * ============================================================================
 *
 * Purpose:
 *   Displays a user-friendly error page when users navigate to
 *   a non-existent route or deleted content.
 *
 * Features:
 *   - Clear 404 error message
 *   - Navigation options (Home, Explore Blogs)
 *   - Clean, minimal design
 *   - Consistent with site branding
 *
 * Usage:
 *   Automatically displayed by React Router when no route matches
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-admas-blue">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link to="/blogs">
            <Button variant="outline" className="w-full">
              Explore Blogs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
