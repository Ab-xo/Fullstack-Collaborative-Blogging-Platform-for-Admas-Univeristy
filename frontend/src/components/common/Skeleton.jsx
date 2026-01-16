import PropTypes from 'prop-types';

const Skeleton = ({ className, width, height, circle }) => {
  return (
    <div
      className={`animate-shimmer bg-gray-200 dark:bg-gray-700/50 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        backgroundSize: '200% 100%'
      }}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  circle: PropTypes.boolean
};

export default Skeleton;
