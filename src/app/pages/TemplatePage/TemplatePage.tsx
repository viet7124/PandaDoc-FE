import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Template {
  id: number;
  title: string;
  category: string;
  downloads: string;
  isPremium: boolean;
  format: string[];
  industry: string[];
}

export default function TemplatePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Presentations']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Mock template data
  const templates: Template[] = [
    { id: 1, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: true, format: ['PowerPoint', 'PDF'], industry: ['Business', 'Finance'] },
    { id: 2, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: false, format: ['PowerPoint'], industry: ['Business'] },
    { id: 3, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: true, format: ['PowerPoint', 'PDF'], industry: ['Business', 'Technology'] },
    { id: 4, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: false, format: ['PowerPoint'], industry: ['Business'] },
    { id: 5, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: true, format: ['PowerPoint', 'PDF'], industry: ['Business', 'Healthcare'] },
    { id: 6, title: 'Business presentation template', category: 'Presentations', downloads: '1.7k times', isPremium: false, format: ['PowerPoint'], industry: ['Business'] },
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleLicenseChange = (license: string) => {
    setSelectedLicenses(prev => 
      prev.includes(license) 
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                onClick={() => window.history.back()}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Templates</h1>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              className="lg:hidden inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-80 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                  {['Presentations', 'Reports', 'Proposals'].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500/25 focus:ring-2 transition-colors duration-200"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Formats Filter */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Formats</h3>
                <div className="space-y-3">
                  {['Word Documents', 'Power Points', 'PDF'].map((format) => (
                    <label key={format} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format)}
                        onChange={() => handleFormatChange(format)}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500/25 focus:ring-2 transition-colors duration-200"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {format}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry Filter */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry</h3>
                <div className="space-y-3">
                  {['Finance', 'Technology', 'Healthcare'].map((industry) => (
                    <label key={industry} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => handleIndustryChange(industry)}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500/25 focus:ring-2 transition-colors duration-200"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {industry}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* License Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">License</h3>
                <div className="space-y-3">
                  {['Free', 'Premium'].map((license) => (
                    <label key={license} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedLicenses.includes(license)}
                        onChange={() => handleLicenseChange(license)}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500/25 focus:ring-2 transition-colors duration-200"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {license}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {templates.length} templates found
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing results for selected filters
                </p>
              </div>
              
              <select className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all duration-200">
                <option>Most relevant</option>
                <option>Most popular</option>
                <option>Newest first</option>
                <option>Oldest first</option>
              </select>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {templates.map((template) => (
                <article key={template.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300">
                  {/* Template Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-green-200 via-emerald-200 to-teal-300 flex items-center justify-center">
                    {template.isPremium && (
                      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                    <div className="text-6xl font-bold text-gray-800 opacity-20">
                      {template.title.split(' ')[0]}
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                        Professional Business Presentation
                      </h3>
                      <p className="text-base font-medium text-gray-600 mb-3">
                        {template.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h8v-2h-8V9h8V7h-8V5h8V3h-8a2 2 0 00-2 2v14a2 2 0 002 2h8v-2h-8z"/>
                        </svg>
                        Downloaded {template.downloads}
                      </div>
                      
                      <Link to={`/templates/${template.id}`} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                        Use template
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2" aria-label="Pagination">
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  1
                </button>
                
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  2
                </button>
                
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  3
                </button>
                
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
                
                <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  10
                </button>
                
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
