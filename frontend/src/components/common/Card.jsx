import { motion } from "framer-motion";

const Card = ({ children, className = "", hover = false, ...props }) => {
  const baseStyles =
    "bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700";
  const hoverStyles = hover
    ? "hover:shadow-lg transition-shadow duration-200"
    : "";

  const CardComponent = hover ? motion.div : "div";
  const motionProps = hover
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <CardComponent
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
