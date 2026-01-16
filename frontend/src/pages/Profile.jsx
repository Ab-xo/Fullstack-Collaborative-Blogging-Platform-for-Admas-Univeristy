/**
 * ============================================================================
 * USER PROFILE PAGE
 * ============================================================================
 *
 * Displays the current user's profile information.
 *
 * DISPLAYED INFORMATION:
 *   - Profile avatar/photo
 *   - Username and full name
 *   - Email address
 *   - Role (student, faculty, alumni)
 *   - Contact information (phone, website)
 *   - Bio/description
 *
 * FEATURES:
 *   - View profile details
 *   - Edit profile button (redirects to edit page)
 *   - Responsive layout
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usersAPI } from "../api/users";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { User, Mail, Phone, Globe, Edit2 } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar
            src={profile?.profile?.avatar}
            alt={profile?.displayName || profile?.email}
            fallback={profile?.displayName || profile?.email}
            size="2xl"
          />
          {/* Display username if exists, otherwise show full name */}
          {profile?.username ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                @{profile.username}
              </h1>
              {profile?.fullName && (
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {profile.fullName}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.email}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                {profile?.displayName ||
                  profile?.fullName ||
                  `${profile?.firstName} ${profile?.lastName}`.trim() ||
                  profile?.email?.split("@")[0]}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {profile?.email}
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <User className="w-5 h-5" />
            <span>Role: {profile?.roleApplication}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5" />
            <span>{profile?.email}</span>
          </div>
          {profile?.profile?.contactInfo?.phone && (
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5" />
              <span>{profile.profile.contactInfo.phone}</span>
            </div>
          )}
          {profile?.profile?.contactInfo?.website && (
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Globe className="w-5 h-5" />
              <a
                href={profile.profile.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.profile.contactInfo.website}
              </a>
            </div>
          )}
        </div>

        {profile?.profile?.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bio
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {profile.profile.bio}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link to="/profile/edit">
            <Button variant="primary" icon={Edit2}>
              Edit Profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
