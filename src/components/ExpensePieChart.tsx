'use client';

import { useMemo } from 'react';
import { ExpenseStats } from '@/types';

interface ExpensePieChartProps {
  stats: ExpenseStats;
}

interface ChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#6b7280', // gray
];

export default function ExpensePieChart({ stats }: ExpensePieChartProps) {
  const chartData = useMemo(() => {
    const total = Object.values(stats.categoryBreakdown).reduce((sum, amount) => sum + amount, 0);
    
    if (total === 0) return [];
    
    return Object.entries(stats.categoryBreakdown)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / total) * 100,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [stats.categoryBreakdown]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No expense data to display
      </div>
    );
  }

  const radius = 80;
  const centerX = 120;
  const centerY = 120;
  
  let cumulativePercentage = 0;
  
  const pathData = chartData.map((item) => {
    const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 2 * Math.PI - Math.PI / 2;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArc = item.percentage > 50 ? 1 : 0;
    
    const pathD = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += item.percentage;
    
    return {
      ...item,
      pathD,
    };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Pie Chart SVG */}
      <div className="flex-shrink-0">
        <svg width="240" height="240" className="drop-shadow-sm">
          {pathData.map((item, index) => (
            <path
              key={item.category}
              d={item.pathD}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${item.category}: ${item.percentage.toFixed(1)}%`}</title>
            </path>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex-1 space-y-3">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
