const ProgressBar = ({ value, color = "bg-blue-500", className = "" }) => {
  return (
    <div
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}
    >
      <div
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
