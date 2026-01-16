import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "md", className = "", text = "" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2
        className={`${sizes[size]} animate-spin text-blue-600 dark:text-blue-400`}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
