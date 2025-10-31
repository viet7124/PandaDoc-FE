import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTemplates, getCategories } from './services/templateAPI';

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
  status?: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  images?: string[];
  previewImages?: string[]; // <-- Add this line
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const filteredTemplates = templates.filter(template => {
    // Only show published templates
    const isPublished = template.status === 'PUBLISHED';
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(template.category.id);
    
    // License filter (Free/Premium based on price)
    const matchesLicense = selectedLicenses.length === 0 || 
      (selectedLicenses.includes('Free') && template.price === 0) ||
      (selectedLicenses.includes('Premium') && template.price > 0);
    
    return isPublished && matchesCategory && matchesLicense;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 6;
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const pagedTemplates = filteredTemplates.slice(
    (currentPage - 1) * templatesPerPage,
    currentPage * templatesPerPage
  );

  // Fetch templates and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch data...');
        
        const [templatesData, categoriesData] = await Promise.all([
          getTemplates(),
          getCategories()
        ]);
        
        console.log('Raw templatesData:', templatesData);
        console.log('Raw categoriesData:', categoriesData);
        
        // Ensure we have arrays before setting state
        if (templatesData && templatesData.content && Array.isArray(templatesData.content)) {
          console.log('Setting templates:', templatesData.content.length, 'items');
          setTemplates(templatesData.content);
          setTotalElements(templatesData.totalElements || 0);
        } else {
          console.warn('Templates data is not valid:', templatesData);
        }
        
        if (categoriesData && Array.isArray(categoriesData)) {
          console.log('Setting categories:', categoriesData.length, 'items');
          setCategories(categoriesData);
        } else {
          console.warn('Categories data is not valid:', categoriesData);
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        console.log('Fetch complete');
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
    // Reset pagination when filters change so results start from page 1
    setCurrentPage(1);
  };

  const handleLicenseChange = (license: string) => {
    setSelectedLicenses(prev => 
      prev.includes(license) 
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
    // Reset pagination when filters change so results start from page 1
    setCurrentPage(1);
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {(selectedCategories.length > 0 || selectedLicenses.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedLicenses([]);
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-3">
                  {categories && Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category.id} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500/25 focus:ring-2 transition-colors duration-200"
                        />
                        <span className="ml-3 text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                          {category.name}
                        </span>
                      </label>
                    ))
                  ) : loading ? (
                    <p className="text-sm text-gray-500">Loading categories...</p>
                  ) : (
                    <p className="text-sm text-gray-500">No categories available</p>
                  )}
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
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <p className="text-red-800 font-medium">Error: {error}</p>
              </div>
            )}

            {/* Results Header */}
            {!loading && !error && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                    </h2>
                    {selectedCategories.length > 0 || selectedLicenses.length > 0 ? (
                      <p className="text-gray-600 mt-1">
                        Filtered from {totalElements} total templates
                      </p>
                    ) : (
                      <p className="text-gray-600 mt-1">
                        Showing all templates
                      </p>
                    )}
                  </div>
                  {/* Sort dropdown removed per request */}
                </div>
              </>
            )}

            {/* Template Grid */}
            {!loading && !error && (
              <>
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {pagedTemplates.map((template) => (
                  <article key={template.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300">
                    {/* Template Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {(() => {
                        const previewSrc = (template.previewImages && template.previewImages.length > 0)
                          ? template.previewImages[0]
                          : (template.images && template.images.length > 0)
                            ? template.images[0]
                            : undefined;
                        return previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={`${template.title} preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null;
                      })()}
                      {/* Default fallback image */}
                      {(() => {
                        const hasPreview = (template.previewImages && template.previewImages.length > 0) || (template.images && template.images.length > 0);
                        return (
                          <div className={`absolute inset-0 flex items-center justify-center ${hasPreview ? 'hidden' : ''}`}>
                            <div className="text-center">
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <div className="text-lg font-medium text-gray-500">No Preview</div>
                            </div>
                          </div>
                        );
                      })()}
                      {template.price > 0 && (
                        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                          {template.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                          {template.description.length > 120 
                            ? `${template.description.substring(0, 120)}...` 
                            : template.description
                          }
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {template.category.name}
                          </span>
                          {(() => {
                            const name = template.author?.username || '';
                            const isAdminAuthor = /admin/i.test(name);
                            return (
                              <span className={`text-sm ${isAdminAuthor ? 'text-white bg-gray-900 px-2 py-0.5 rounded-md' : 'text-gray-500'}`}>
                                {isAdminAuthor ? 'By ADMIN' : `by ${name}`}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          {template.price === 0 ? (
                            <span className="font-bold text-green-600">FREE</span>
                          ) : (
                            <span className="font-bold text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              }).format(template.price)}
                            </span>
                          )}
                        </div>
                        
                        <Link to={`/templates/${template.id}`} className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25">
                          View
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 ${currentPage === i + 1 ? 'text-white bg-green-600 border-green-600' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                >
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
