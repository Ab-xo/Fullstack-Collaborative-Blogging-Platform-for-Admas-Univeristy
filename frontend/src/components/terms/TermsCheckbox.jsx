/**
 * TermsCheckbox - Reusable checkbox component for terms acceptance
 */
import React from "react";

const TermsCheckbox = ({
  checked,
  onCheckedChange,
  onTermsClick,
  onPrivacyClick,
  error,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="terms-acceptance"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="terms-acceptance"
          className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer"
        >
          I agree to the{" "}
          <button
            type="button"
            onClick={onTermsClick}
            className="text-blue-600 hover:underline font-medium"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={onPrivacyClick}
            className="text-blue-600 hover:underline font-medium"
          >
            Privacy Policy
          </button>
        </label>
      </div>
      {error && <p className="text-sm text-red-500 ml-7">{error}</p>}
    </div>
  );
};

export default TermsCheckbox;
