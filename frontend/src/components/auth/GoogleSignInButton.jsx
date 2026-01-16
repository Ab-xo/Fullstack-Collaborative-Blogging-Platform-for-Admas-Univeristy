import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../common/Button";
import toast from "react-hot-toast";
import { setToken, setRefreshToken, setUser } from "../../utils/storage";

const GoogleSignInButton = ({ isRegister = false }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Validate Firebase is initialized
      if (!auth) {
        throw new Error(
          "Firebase is not initialized. Please check your configuration."
        );
      }

      console.log("🔵 Starting Google Sign-In...");
      console.log("Auth object:", auth ? "✅ Present" : "❌ Missing");
      console.log(
        "Google Provider:",
        googleProvider ? "✅ Present" : "❌ Missing"
      );

      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google Sign-In successful");
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      if (isRegister) {
        // For registration, redirect to complete profile
        console.log("📝 Redirecting to complete profile page...");
        setTimeout(() => {
          navigate("/complete-google-profile", {
            state: {
              firebaseUser: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                idToken,
              },
              from: location.state?.from, // Pass along the original destination
            },
          });
        }, 500);
      } else {
        // For login, verify token with backend
        console.log("🔐 Verifying token with backend...");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/google-login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google sign-in failed");
        }

        console.log("✅ Token verified, storing user data...");
        // Store tokens and user data using the correct storage utility
        setToken(data.accessToken);
        console.log("✅ Access token stored");

        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
          console.log("✅ Refresh token stored");
        }

        setUser(data.user);
        console.log("✅ User data stored");

        toast.success("Signed in with Google successfully!");
        console.log("🚀 Updating auth context and redirecting...");

        // Determine redirect path
        const from = location.state?.from?.pathname;
        const userRoles = data.user?.roles || [];
        let redirectPath = "/dashboard";

        if (from && from !== "/login" && from !== "/register" && from !== "/") {
          // Verify user has permission for the saved path
          if (from.startsWith("/admin") && !userRoles.includes("admin")) {
            redirectPath = "/dashboard";
          } else if (
            from.startsWith("/moderator") &&
            !userRoles.includes("admin") &&
            !userRoles.includes("moderator")
          ) {
            redirectPath = "/dashboard";
          } else {
            redirectPath = from;
          }
        } else {
          if (userRoles.includes("admin")) {
            redirectPath = "/admin";
          } else if (userRoles.includes("moderator")) {
            redirectPath = "/moderator";
          }
        }

        // Wait for localStorage to be written, then check auth and redirect
        setTimeout(async () => {
          await checkAuth();
          navigate(redirectPath, { replace: true });
        }, 300);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
      loading={loading}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {isRegister ? "Sign up with Google" : "Sign in with Google"}
    </Button>
  );
};

export default GoogleSignInButton;
