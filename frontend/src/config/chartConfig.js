// Chart.js is registered in utils/chartSetup.js
// This file only contains configuration and utilities

// Color palette
export const colors = {
  primary: '#3B82F6',    // blue-500
  success: '#10B981',    // green-500
  warning: '#F59E0B',    // yellow-500
  danger: '#EF4444',     // red-500
  info: '#8B5CF6',       // purple-500
  gray: '#6B7280',       // gray-500
  
  // Chart colors
  chart: [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#6366F1', // indigo
    '#84CC16', // lime
  ],
  
  // Gradient colors
  gradients: {
    blue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)'],
    green: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'],
    yellow: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.1)'],
    red: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)'],
    purple: ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.1)'],
  }
};

// Common chart options
export const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat().format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  }
};

// Line chart specific options
export const lineChartOptions = {
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat().format(value);
        }
      }
    },
    x: {
      grid: {
        display: false,
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 3,
      hoverRadius: 5,
      hitRadius: 10,
    }
  }
};

// Bar chart specific options
export const barChartOptions = {
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat().format(value);
        }
      }
    },
    x: {
      grid: {
        display: false,
      }
    }
  }
};

// Pie/Doughnut chart specific options
export const pieChartOptions = {
  ...commonOptions,
  plugins: {
    ...commonOptions.plugins,
    legend: {
      position: 'right',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    }
  }
};

// Area chart specific options
export const areaChartOptions = {
  ...lineChartOptions,
  elements: {
    ...lineChartOptions.elements,
    line: {
      ...lineChartOptions.elements.line,
      fill: true,
    }
  }
};

// Radar chart specific options
export const radarChartOptions = {
  ...commonOptions,
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        backdropColor: 'transparent',
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 3,
      hoverRadius: 5,
    }
  }
};

// Utility function to create gradient
export const createGradient = (ctx, chartArea, colorStart, colorEnd) => {
  if (!chartArea) return colorStart;
  
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, colorEnd);
  gradient.addColorStop(1, colorStart);
  return gradient;
};

// Utility function to get responsive legend position
export const getResponsiveLegendPosition = () => {
  return window.innerWidth < 768 ? 'bottom' : 'right';
};

export default {
  colors,
  commonOptions,
  lineChartOptions,
  barChartOptions,
  pieChartOptions,
  areaChartOptions,
  radarChartOptions,
  createGradient,
  getResponsiveLegendPosition
};
