const LoadingChart = ({ type = "bar", height = 300 }) => {
  return (
    <div
      className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-end justify-around h-full p-4">
        {type === "bar" && (
          <>
            <div
              className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ height: "60%" }}
            />
            <div
              className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ height: "80%" }}
            />
            <div
              className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ height: "40%" }}
            />
            <div
              className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ height: "70%" }}
            />
            <div
              className="w-12 bg-gray-300 dark:bg-gray-600 rounded-t"
              style={{ height: "50%" }}
            />
          </>
        )}
        {type === "line" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-1/2 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        )}
        {type === "pie" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingChart;
