/**
 * ContentGuidelinesPanel - Summary panel for post creation page
 */
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const guidelines = [
  {
    title: "Educational Value",
    description:
      "Focus on academic topics, research, and learning. Support claims with credible sources.",
    icon: "📚",
  },
  {
    title: "Originality",
    description:
      "Create original content or properly cite sources. Avoid plagiarism.",
    icon: "✍️",
  },
  {
    title: "Respectful Communication",
    description: "Engage in constructive dialogue. Respect diverse viewpoints.",
    icon: "🤝",
  },
  {
    title: "Quality Standards",
    description:
      "Use clear, professional language. Proofread for grammar and spelling.",
    icon: "✨",
  },
];

const prohibitedContent = [
  "Harassment, bullying, or personal attacks",
  "Hate speech or discriminatory language",
  "Plagiarized content without attribution",
  "Sexually explicit or violent material",
  "Spam or promotional content",
];

const ContentGuidelinesPanel = ({
  acknowledged = false,
  onAcknowledge,
  showAcknowledgment = true,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [checked, setChecked] = useState(acknowledged);

  const handleAcknowledge = () => {
    setChecked(true);
    if (onAcknowledge) {
      onAcknowledge();
    }
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
      <CardHeader
        className="cursor-pointer py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Content Guidelines
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!expanded && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review our content guidelines before publishing
          </p>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* What to Include */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              What to Include
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {guidelines.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-gray-800/50"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to Avoid */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              What to Avoid
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {prohibitedContent.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Full Guidelines Link */}
          <div className="pt-2 border-t">
            <Link
              to="/terms?tab=content-guidelines"
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Read full content guidelines
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Acknowledgment Checkbox */}
          {showAcknowledgment && !acknowledged && (
            <div className="pt-2 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="guidelines-acknowledgment"
                  checked={checked}
                  onCheckedChange={handleAcknowledge}
                  className="mt-1"
                />
                <Label
                  htmlFor="guidelines-acknowledgment"
                  className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer"
                >
                  I have read and agree to follow the content guidelines
                </Label>
              </div>
            </div>
          )}

          {acknowledged && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                You have acknowledged the content guidelines
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ContentGuidelinesPanel;
