import React, { useState } from 'react';

interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  format: string;
  status: 'published' | 'draft' | 'pending';
}

const mockTemplates: Template[] = [
  {
    id: 1,
    title: 'Template Báo cáo Thực tập Doanh nghiệp',
    description: 'Template báo cáo thực tập với format chuẩn theo yêu cầu của FPTSoft',
    category: 'QHHT',
    format: 'Word',
    status: 'published'
  }
];

export default function TemplateManagement(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [templates] = useState<Template[]>(mockTemplates);

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string): JSX.Element => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'published':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
      case 'draft':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Draft</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const getCategoryBadge = (category: string): JSX.Element => {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{category}</span>;
  };

  const getFormatBadge = (format: string): JSX.Element => {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">{format}</span>;
  };

  return (
    <div className="p-6 ml-64 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tiếp nhận đề xuất template</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tất cả"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Template Cards */}
        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Không có template nào được tìm thấy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {template.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 ml-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {getCategoryBadge(template.category)}
                    {getFormatBadge(template.format)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(template.status)}
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
                        Duyệt
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
