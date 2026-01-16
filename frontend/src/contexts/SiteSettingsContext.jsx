import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const SiteSettingsContext = createContext(null);

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    // Return default values if context is not available
    return {
      siteName: "Admas University Collaborative Blogging",
      siteDescription: "A collaborative blogging platform for Admas University",
      loading: false,
      error: null,
    };
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: "Admas University Collaborative Blogging",
    siteDescription: "A collaborative blogging platform for Admas University",
    contactEmail: "support@admas.edu.et",
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to get public settings
        const response = await apiClient.get("/public/site-settings");
        if (response.data?.settings) {
          setSettings((prev) => ({
            ...prev,
            ...response.data.settings,
          }));
        }
      } catch (err) {
        // If endpoint doesn't exist or fails, use defaults
        console.log("Using default site settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const value = {
    ...settings,
    loading,
    error,
    refreshSettings: async () => {
      try {
        const response = await apiClient.get("/public/site-settings");
        if (response.data?.settings) {
          setSettings((prev) => ({
            ...prev,
            ...response.data.settings,
          }));
        }
      } catch (err) {
        console.error("Failed to refresh settings:", err);
      }
    },
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsProvider;
