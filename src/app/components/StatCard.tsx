import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  iconBg 
}: StatCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <svg 
                className={`w-4 h-4 mr-1 ${
                  changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={changeType === 'positive' 
                    ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                    : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  } 
                />
              </svg>
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
