import React from 'react';

// Simple Custom Chart Component that doesn't rely on Chart.js
const ChartComponent = ({ type, data }) => {
  // Get max value for scaling
  const getMaxValue = () => {
    if (!data || !data.datasets || data.datasets.length === 0) return 100;
    
    return data.datasets.reduce((max, dataset) => {
      const datasetMax = Math.max(...dataset.data);
      return datasetMax > max ? datasetMax : max;
    }, 0);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  // Render a simple bar chart
  const renderBarChart = () => {
    const maxValue = getMaxValue();
    const barWidth = data.datasets.length <= 1 ? 60 : 30;
    
    return (
      <div className="w-full h-full flex items-end space-x-2 px-4">
        {data.labels.map((label, labelIndex) => (
          <div key={label} className="flex-1 flex flex-col items-center">
            <div className="w-full h-[85%] flex flex-row justify-center items-end space-x-1">
              {data.datasets.map((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex] || 0;
                const height = `${(value / maxValue) * 100}%`;
                
                return (
                  <div key={datasetIndex} className="group relative">
                    <div 
                      className={`w-${barWidth} rounded-t-md cursor-pointer hover:opacity-80 transition-all`}
                      style={{ 
                        height, 
                        width: `${barWidth}px`,
                        backgroundColor: dataset.backgroundColor || dataset.borderColor
                      }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                      {dataset.label}: {formatNumber(value)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs mt-2 text-gray-500 truncate max-w-full text-center">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render a simple line chart
  const renderLineChart = () => {
    const maxValue = getMaxValue();
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative border-b border-gray-200 px-4">
          {data.datasets.map((dataset, datasetIndex) => (
            <div 
              key={datasetIndex}
              className="absolute bottom-0 left-0 right-0 h-full px-4"
            >
              <svg 
                className="w-full h-full" 
                viewBox={`0 0 ${data.labels.length - 1} 100`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={
                    dataset.data.map((value, i) => {
                      const x = i;
                      const y = 100 - ((value / maxValue) * 100);
                      return `${x},${y}`;
                    }).join(' ')
                  }
                  fill="none"
                  stroke={dataset.borderColor}
                  strokeWidth="3"
                />
                
                {/* Add dots at data points */}
                {dataset.data.map((value, i) => {
                  const x = i;
                  const y = 100 - ((value / maxValue) * 100);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={dataset.borderColor}
                      className="hover:r-6 cursor-pointer transition-all"
                    />
                  );
                })}
              </svg>
            </div>
          ))}
          
          {/* Legend */}
          <div className="absolute top-0 right-0 flex items-center space-x-4 px-4 py-2">
            {data.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 mr-1"
                  style={{ backgroundColor: dataset.borderColor }}
                />
                <span className="text-xs text-gray-600">{dataset.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-8 flex px-4">
          {data.labels.map((label) => (
            <div key={label} className="flex-1 text-center text-xs text-gray-500 truncate pt-1">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render a simple doughnut chart
  const renderDoughnutChart = () => {
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    
    // Calculate start and end angles for each segment
    let startAngle = 0;
    const segments = data.datasets[0].data.map((value, i) => {
      const percentage = (value / total);
      const angle = percentage * 360;
      const segment = {
        value,
        percentage: percentage * 100,
        color: data.datasets[0].backgroundColor[i],
        label: data.labels[i],
        startAngle,
        endAngle: startAngle + angle
      };
      startAngle += angle;
      return segment;
    });
    
    return (
      <div className="w-full h-full flex">
        <div className="w-1/2 flex justify-center items-center relative">
          <div className="relative w-48 h-48">
            {segments.map((segment, index) => {
              const startAngleRad = (segment.startAngle - 90) * Math.PI / 180;
              const endAngleRad = (segment.endAngle - 90) * Math.PI / 180;
              
              const x1 = 24 + 24 * Math.cos(startAngleRad);
              const y1 = 24 + 24 * Math.sin(startAngleRad);
              const x2 = 24 + 24 * Math.cos(endAngleRad);
              const y2 = 24 + 24 * Math.sin(endAngleRad);
              
              const largeArcFlag = segment.percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M 24 24`,
                `L ${x1} ${y1}`,
                `A 24 24 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <div key={index} className="absolute inset-0 group cursor-pointer">
                  <svg 
                    viewBox="0 0 48 48" 
                    width="100%" 
                    height="100%"
                    className="transition-transform hover:scale-105"
                  >
                    <path
                      d={pathData}
                      fill={segment.color}
                      className="hover:opacity-90 transition-opacity"
                    />
                    <circle cx="24" cy="24" r="12" fill="white" />
                  </svg>
                  
                  {/* Tooltip */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-4 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                    {segment.label}: {formatNumber(segment.value)} ({segment.percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total in the center */}
          <div className="absolute text-center">
            <div className="text-gray-600 text-xs">Total</div>
            <div className="font-bold text-gray-800">{formatNumber(total)}</div>
          </div>
        </div>
        
        <div className="w-1/2 flex flex-col justify-center">
          {segments.map((segment, index) => (
            <div key={segment.label} className="flex items-center mb-3 group cursor-pointer">
              <div 
                className="w-4 h-4 mr-3 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{segment.label}</div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{formatNumber(segment.value)}</span>
                  <span className="font-medium">{segment.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render based on chart type
  switch (type) {
    case 'bar':
      return renderBarChart();
    case 'line':
      return renderLineChart();
    case 'doughnut':
      return renderDoughnutChart();
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Chart visualization not available</p>
        </div>
      );
  }
};

export default ChartComponent; 