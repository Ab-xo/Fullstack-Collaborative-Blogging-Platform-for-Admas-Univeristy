/**
 * Chart.js Global Configuration
 * Registers all necessary components for Chart.js to work properly
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Set default options
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

export default ChartJS;
