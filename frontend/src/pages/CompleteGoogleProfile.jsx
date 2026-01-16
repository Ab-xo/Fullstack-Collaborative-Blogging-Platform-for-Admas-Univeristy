/**
 * ============================================================================
 * COMPLETE GOOGLE PROFILE PAGE - OAUTH PROFILE COMPLETION
 * ============================================================================
 *
 * Purpose:
 *   Collects additional required information from users who sign up
 *   using Google OAuth, as Google doesn't provide university-specific data.
 *
 * Features:
 *   - Account type selection (Reader/Author)
 *   - Role selection (Student, Faculty, Alumni)
 *   - University ID input
 *   - Department selection
 *   - Year of study (for students)
 *   - Position (for faculty)
 *   - Graduation year (for alumni)
 *   - Verification document upload
 *
 * Flow:
 *   1. User signs in with Google
 *   2. System detects incomplete profile
 *   3. User fills in university-specific details
 *   4. Profile is completed and user can access platform
 *
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building,
  CreditCard,
  User,
  PenLine,
  BookMarked,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import toast from "react-hot-toast";
import { authAPI } from "../api/auth";

const CompleteGoogleProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [accountType, setAccountType] = useState(""); // reader or author
  const [roleApplication, setRoleApplication] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    universityId: "",
    department: "",
    yearOfStudy: "",
    position: "",
    graduationYear: "",
    verificationDocument: "",
  });

  useEffect(() => {
    const user = location.state?.firebaseUser;
    if (!user) {
      navigate("/register");
      return;
    }

    setFirebaseUser(user);

    // Pre-fill name from Google
    if (user.displayName) {
      const [firstName, ...lastNameParts] = user.displayName.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
      }));
    }
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountType) {
      toast.error("Please select your account type (Reader or Author)");
      return;
    }

    if (!roleApplication) {
      toast.error("Please select your university affiliation");
      return;
    }

    if (!formData.universityId) {
      toast.error("University ID is required");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: firebaseUser.email,
        accountType, // Include account type (reader/author)
        roleApplication,
        universityId: formData.universityId,
        department: formData.department || undefined,
        yearOfStudy: formData.yearOfStudy || undefined,
        position: formData.position || undefined,
        graduationYear: formData.graduationYear || undefined,
        verificationDocument: formData.verificationDocument || undefined,
        firebaseUid: firebaseUser.uid,
        idToken: firebaseUser.idToken,
      };

      const response = await authAPI.googleRegister(registrationData);

      toast.success(
        "Registration successful! Your account is ready. You can now login with Google."
      );

      // Google users are auto-approved, redirect to login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl w-full p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome {firebaseUser.displayName || firebaseUser.email}! Please
            complete your profile to finish registration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              icon={User}
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              icon={User}
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Email (Read-only) */}
          <Input
            label="Email Address"
            type="email"
            value={firebaseUser.email}
            disabled
            placeholder="your.email@admas.edu.et"
          />

          {/* Account Type Selection - Reader or Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What would you like to do? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  accountType === "reader"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="reader"
                  checked={accountType === "reader"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="sr-only"
                />
                <BookMarked
                  className={`w-8 h-8 mb-2 ${
                    accountType === "reader" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Reader
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  Browse, read & engage with posts
                </p>
              </label>

              <label
                className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  accountType === "author"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value="author"
                  checked={accountType === "author"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="sr-only"
                />
                <PenLine
                  className={`w-8 h-8 mb-2 ${
                    accountType === "author" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Author
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  Write & publish blog posts
                </p>
              </label>
            </div>
          </div>

          {/* Role Application (University Affiliation) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              University Affiliation <span className="text-red-500">*</span>
            </label>
            <select
              value={roleApplication}
              onChange={(e) => setRoleApplication(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select your affiliation</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* University ID */}
          <Input
            label="University ID"
            placeholder="e.g., ADM12345"
            icon={CreditCard}
            name="universityId"
            value={formData.universityId}
            onChange={handleInputChange}
            required
          />

          {/* Conditional Fields Based on Role */}
          {(roleApplication === "student" || roleApplication === "faculty") && (
            <Input
              label="Department"
              placeholder="e.g., Computer Science"
              icon={Building}
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          )}

          {roleApplication === "student" && (
            <Input
              label="Year of Study"
              placeholder="e.g., 3rd Year"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleInputChange}
              required
            />
          )}

          {roleApplication === "faculty" && (
            <Input
              label="Position"
              placeholder="e.g., Assistant Professor"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          )}

          {roleApplication === "alumni" && (
            <Input
              label="Graduation Year"
              placeholder="e.g., 2020"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleInputChange}
              required
            />
          )}

          {roleApplication === "alumni" && (
            <Input
              label="Verification Document URL"
              placeholder="Link to your graduation certificate"
              name="verificationDocument"
              value={formData.verificationDocument}
              onChange={handleInputChange}
              required
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Complete Registration
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CompleteGoogleProfile;
