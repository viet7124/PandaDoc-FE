import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

interface Template {
  id: number;
  title: string;
  category: string;
  downloads: string;
  isPremium: boolean;
  format: string[];
  industry: string[];
  description: string;
  author: string;
  rating: number;
  price?: number;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  
  const query = searchParams.get('q') || searchParams.get('query') || 'business report';
  const itemsPerPage = 12;

  // Mock search results data
  const searchResults: Template[] = [
    {
      id: 1,
      title: '2030 Annual Report',
      category: 'Reports',
      downloads: '1.7k times',
      isPremium: false,
      format: ['PowerPoint', 'PDF'],
      industry: ['Business', 'Finance'],
      description: 'Professional Business Presentation',
      author: 'Global Business Solutions',
      rating: 4.8,
      price: 0
    },
    {
      id: 2,
      title: 'Annual Report - Medical Company',
      category: 'Reports',
      downloads: '1.2k times',
      isPremium: false,
      format: ['PowerPoint', 'PDF'],
      industry: ['Healthcare', 'Business'],
      description: 'Professional Business Presentation',
      author: 'Medical Corp',
      rating: 4.9,
      price: 0
    },
    {
      id: 3,
      title: 'Annual Report - Blue Design',
      category: 'Reports',
      downloads: '2.1k times',
      isPremium: true,
      format: ['PowerPoint', 'PDF', 'Word'],
      industry: ['Business', 'Technology'],
      description: 'Professional Business Presentation',
      author: 'Design Studio Pro',
      rating: 4.7,
      price: 29.99
    },
    {
      id: 4,
      title: 'Annual Report - Purple Gradient',
      category: 'Reports',
      downloads: '1.5k times',
      isPremium: false,
      format: ['PowerPoint'],
      industry: ['Business', 'Marketing'],
      description: 'Professional Business Presentation',
      author: 'Creative Templates',
      rating: 4.6,
      price: 0
    },
    {
      id: 5,
      title: 'Business Presentation - Modern',
      category: 'Presentations',
      downloads: '3.2k times',
      isPremium: true,
      format: ['PowerPoint', 'PDF'],
      industry: ['Business', 'Technology'],
      description: 'Professional Business Presentation',
      author: 'Modern Designs',
      rating: 4.9,
      price: 39.99
    },
    {
      id: 6,
      title: 'Business Strategy Report',
      category: 'Reports',
      downloads: '1.8k times',
      isPremium: false,
      format: ['Word', 'PDF'],
      industry: ['Business', 'Consulting'],
      description: 'Professional Business Presentation',
      author: 'Strategy Consultants',
      rating: 4.5,
      price: 0
    }
  ];

  const filteredResults = searchResults.filter(template => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(template.category);
    const matchesFormat = selectedFormats.length === 0 || template.format.some(f => selectedFormats.includes(f));
    const matchesIndustry = selectedIndustries.length === 0 || template.industry.some(i => selectedIndustries.includes(i));
    const matchesLicense = selectedLicenses.length === 0 || 
      (selectedLicenses.includes('Free') && !template.isPremium) ||
      (selectedLicenses.includes('Premium') && template.isPremium);
    
    return matchesCategory && matchesFormat && matchesIndustry && matchesLicense;
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
    setCurrentPage(1);
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
    setCurrentPage(1);
  };

  const handleLicenseChange = (license: string) => {
    setSelectedLicenses(prev => 
      prev.includes(license) 
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedFormats([]);
    setSelectedIndustries([]);
    setSelectedLicenses([]);
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {(selectedCategories.length > 0 || selectedFormats.length > 0 || selectedIndustries.length > 0 || selectedLicenses.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Category Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                  <div className="space-y-3">
                    {['Presentations', 'Reports', 'Proposals'].map((category) => (
                      <label key={category} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Format Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formats</h3>
                  <div className="space-y-3">
                    {['Word Documents', 'Power Points', 'PDF'].map((format) => (
                      <label key={format} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFormats.includes(format)}
                          onChange={() => handleFormatChange(format)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                          {format}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Industry Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry</h3>
                  <div className="space-y-3">
                    {['Finance', 'Technology', 'Healthcare'].map((industry) => (
                      <label key={industry} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          onChange={() => handleIndustryChange(industry)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                          {industry}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* License Filter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">License</h3>
                  <div className="space-y-3">
                    {['Free', 'Premium'].map((license) => (
                      <label key={license} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedLicenses.includes(license)}
                          onChange={() => handleLicenseChange(license)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                          {license}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
              <p className="text-lg text-gray-600">
                {filteredResults.length} templates found for "{query}"
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results */}
            {paginatedResults.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.044-5.709-2.709M15 3.935c.915.329 1.728.834 2.465 1.481L19.414 3.5a.5.5 0 01.707 0l.707.707a.5.5 0 010 .707L18.879 6.86A8.966 8.966 0 0121 12a8.966 8.966 0 01-2.121 5.14l1.949 1.946a.5.5 0 010 .707l-.707.707a.5.5 0 01-.707 0L17.465 18.554A7.962 7.962 0 0112 21c-2.34 0-4.29-1.044-5.709-2.709" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }>
                {paginatedResults.map((template) => (
                  <Link
                    key={template.id}
                    to={`/templates/${template.id}`}
                    className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : 'block'
                    }`}
                  >
                    {/* Template Preview */}
                    <div className={`relative bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center ${
                      viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48'
                    }`}>
                      {template.isPremium && (
                        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      )}
                      <div className={`font-bold text-gray-800 opacity-20 ${
                        viewMode === 'list' ? 'text-3xl' : 'text-6xl'
                      }`}>
                        {template.category === 'Reports' ? '📊' : 
                         template.category === 'Presentations' ? '📈' : '📋'}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className={viewMode === 'list' ? 'flex-1 p-4' : 'p-6'}>
                      <h3 className={`font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight mb-2 ${
                        viewMode === 'list' ? 'text-lg' : 'text-xl'
                      }`}>
                        {template.title}
                      </h3>

                      <p className={`text-gray-600 mb-3 ${viewMode === 'list' ? 'text-sm' : ''}`}>
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Download {template.downloads}</span>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{template.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {template.format.slice(0, 2).map((format) => (
                            <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {format}
                            </span>
                          ))}
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                          Use template
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && paginatedResults.length > 0 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50 border border-gray-300 hover:border-green-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Show ellipsis and last page if needed */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 border border-gray-300 hover:border-green-300 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
