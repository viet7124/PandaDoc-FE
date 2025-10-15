import React from 'react';

interface Template {
  id: number;
  name: string;
  views: string;
  rank: number;
}

const topTemplates: Template[] = [
  { id: 1, name: 'Báo cáo thực tập doanh nghiệp', views: '123 Lượt tải', rank: 1 },
  { id: 2, name: 'Slide thuyết trình đồ án', views: '98 Lượt tải', rank: 2 },
  { id: 3, name: 'Template Bài tập Nhóm', views: '88 Lượt tải', rank: 3 }
];

export default function TopTemplatesCard(): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top template</h3>
      <div className="space-y-4">
        {topTemplates.map((template) => (
          <div key={template.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                template.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                template.rank === 2 ? 'bg-gray-100 text-gray-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {template.rank}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{template.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">{template.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
