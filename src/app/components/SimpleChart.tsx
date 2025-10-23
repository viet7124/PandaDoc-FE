import { type JSX } from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type?: 'line' | 'bar';
}

export default function SimpleChart({ data, title, type = 'line' }: SimpleChartProps): JSX.Element {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
            Week
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-md">
            Month
          </button>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex items-end justify-center h-48">
                {type === 'line' ? (
                  <div 
                    className="w-2 bg-blue-500 rounded-t-sm" 
                    style={{ height: `${height}%` }}
                  />
                ) : (
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm max-w-8" 
                    style={{ height: `${height}%` }}
                  />
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
