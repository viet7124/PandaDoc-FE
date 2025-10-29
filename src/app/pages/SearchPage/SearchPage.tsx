import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const url = import.meta.env.VITE_BASE_URL + 'api';

interface Category {
  id: number;
  name: string;
}

interface Author {
  id: number;
  username: string;
}

interface Template {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  category: Category;
  author: Author;
}

interface TemplatesResponse {
  content: Template[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true'
  };
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const itemsPerPage = 12;

  // Redirect to templates page if no search query
  useEffect(() => {
    if (!query) {
      navigate('/templates');
    }
  }, [query, navigate]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch templates
        const templatesResponse = await axios.get<TemplatesResponse>(`${url}/templates`, {
          headers: getAuthHeaders()
        });
        
        if (templatesResponse.data && Array.isArray(templatesResponse.data.content)) {
          setTemplates(templatesResponse.data.content);
        }
        
        // Fetch categories
        const categoriesResponse = await axios.get<Category[]>(`${url}/templates/categories`, {
          headers: getAuthHeaders()
        });
        
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching search data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter templates based on search query and filters
  const filteredResults = templates.filter(template => {
    // Search query match (title or description)
    const matchesQuery = query === '' || 
      template.title.toLowerCase().includes(query.toLowerCase()) ||
      template.description.toLowerCase().includes(query.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(template.category.id);
    
    // License filter (Free/Premium based on price)
    const matchesLicense = selectedLicenses.length === 0 || 
      (selectedLicenses.includes('Free') && template.price === 0) ||
      (selectedLicenses.includes('Premium') && template.price > 0);
    
    return matchesQuery && matchesCategory && matchesLicense;
  });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
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
    setSelectedLicenses([]);
    setCurrentPage(1);
    // If there's a search query, clear it and redirect to templates page
    if (query) {
      navigate('/templates');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Templates</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                {(selectedCategories.length > 0 || selectedLicenses.length > 0) && (
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
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <label key={category.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
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
                {filteredResults.length} templates found{query ? ` for "${query}"` : ''}
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
                      {template.price > 0 && (
                        <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      )}
                      <div className={`font-bold text-gray-800 opacity-20 ${
                        viewMode === 'list' ? 'text-3xl' : 'text-6xl'
                      }`}>
                        📄
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className={viewMode === 'list' ? 'flex-1 p-4' : 'p-6'}>
                      <h3 className={`font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight mb-2 ${
                        viewMode === 'list' ? 'text-lg' : 'text-xl'
                      }`}>
                        {template.title}
                      </h3>

                      <p className={`text-gray-600 mb-3 line-clamp-2 ${viewMode === 'list' ? 'text-sm' : ''}`}>
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                          {template.category.name}
                        </span>
                        <span className="text-gray-600">
                          by {template.author.username}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          {template.price === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span>{template.price.toLocaleString('vi-VN')} đ</span>
                          )}
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
