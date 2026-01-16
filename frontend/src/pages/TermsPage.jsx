/**
 * TermsPage - Dedicated page for viewing Terms of Service, Privacy Policy, and Content Guidelines
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  FileText,
  Shield,
  BookOpen,
  Calendar,
  Tag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const tabConfig = {
  tos: {
    label: "Terms of Service",
    icon: FileText,
    color: "text-blue-600",
  },
  privacy: {
    label: "Privacy Policy",
    icon: Shield,
    color: "text-green-600",
  },
  "content-guidelines": {
    label: "Content Guidelines",
    icon: BookOpen,
    color: "text-purple-600",
  },
};

const TermsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "tos");
  const [termsData, setTermsData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Update URL when tab changes
    setSearchParams({ tab: activeTab });

    // Fetch terms if not already loaded
    if (!termsData[activeTab] && !loading[activeTab]) {
      fetchTerms(activeTab);
    }
  }, [activeTab]);

  const fetchTerms = async (type) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    setErrors((prev) => ({ ...prev, [type]: null }));

    try {
      const response = await api.get(`/terms/${type}`);
      if (response.data.success) {
        setTermsData((prev) => ({ ...prev, [type]: response.data.data }));
      } else {
        setErrors((prev) => ({ ...prev, [type]: "Failed to load content" }));
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setErrors((prev) => ({
        ...prev,
        [type]: "Failed to load content. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderContent = (type) => {
    const terms = termsData[type];
    const isLoading = loading[type];
    const error = errors[type];
    const config = tabConfig[type];
    const Icon = config.icon;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchTerms(type)}
            className="text-blue-600 hover:underline"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!terms) {
      return (
        <div className="text-center py-16 text-gray-500">
          No content available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b pb-4 gap-4">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${config.color}`} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {terms.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{terms.summary}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 sm:text-right">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>Version {terms.version}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              <span>
                Updated {new Date(terms.effectiveDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{terms.content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Legal & Policies
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review our terms of service, privacy policy, and content guidelines
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap">
            {Object.entries(tabConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">
                    {key === "tos"
                      ? "ToS"
                      : key === "privacy"
                      ? "Privacy"
                      : "Guidelines"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent(activeTab)}</div>
      </div>
    </div>
  );
};

export default TermsPage;
