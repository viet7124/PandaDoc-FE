import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authUtils';
import heroImage from '../../assets/avatar.png';

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
  status?: 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  images?: string[];
}

// use shared getAuthHeaders; but popular templates endpoint typically doesn't require auth

export default function Home() {
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTemplates = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Template[]>(`${url}/templates/popular`, {
          headers: getAuthHeaders()
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Filter to only show published templates
          const publishedTemplates = response.data.filter(template => template.status === 'PUBLISHED');
          setPopularTemplates(publishedTemplates.slice(0, 3)); // Get first 3 published templates
        }
      } catch (error) {
        console.error('Error fetching popular templates:', error);
        // If error, keep empty array
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTemplates();
  }, []);
  return (
    <div className="bg-[#EEF0F2] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-10">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  Create professional 
                  <span className="block text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
                    documents
                  </span>
                  <span className="block">in minutes</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                  Access hundreds of professionally designed templates for reports, presentations, and outlines to make your work stand out.
                </p>
              </div>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/templates"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/25"
                  aria-label="View all available templates"
                >
                  <span>View Templates</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] bg-gradient-to-br from-blue-400 via-green-400 to-emerald-500 rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                  <img 
                    src={heroImage} 
                    alt="PandaDocs Hero" 
                    className="w-full h-full object-cover"
                  />
                  {/* Floating elements for visual interest */}
                  <div className="absolute top-8 left-8 w-4 h-4 bg-white/30 rounded-full animate-bounce"></div>
                  <div className="absolute top-16 right-12 w-3 h-3 bg-white/40 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-32 left-12 w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose PandaDocs Section */}
      <section className="bg-gradient-to-b from-[#C2FFAF] to-[#61B148] py-20 lg:py-32" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Why choose PandaDocs?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Streamline your document creation process with our easy-to-use platform
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Professional Templates */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-300">
                Professional Templates
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Access hundreds of professionally designed templates for any business need, from presentations to reports.
              </p>
            </div>

            {/* Easy Customization */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                Easy Customization
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Personalize any template to match your brand with our intuitive drag-and-drop editor.
              </p>
            </div>

            {/* Instant Download */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/20 md:col-span-2 lg:col-span-1">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                Instant Download
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Create and download your documents in multiple formats (PDF, Word, PowerPoint) instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Document Templates Section */}
      <section className="bg-white py-20 lg:py-32" aria-labelledby="templates-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <h2 id="templates-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Document Templates for Every Need
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Browse our extensive library of templates organized by category
            </p>
          </div>

          {/* Template Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Presentations */}
            <div className="group bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mr-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">
                Presentations
              </h3>
              <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                Professional slide decks for business, education, and more.
              </p>
              <Link to="/templates" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-2 py-1">
                Browse templates
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Reports */}
            <div className="group bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mr-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors duration-300">
                Reports
              </h3>
              <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                Comprehensive reports for business, research, and analytics.
              </p>
              <Link to="/templates" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-2 py-1">
                Browse templates
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Outlines */}
            <div className="group bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mr-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors duration-300">
                Outlines
              </h3>
              <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                Structured outlines for projects, essays, and research papers.
              </p>
              <Link to="/templates" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-2 py-1">
                Browse templates
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Proposals */}
            <div className="group bg-white border-2 border-green-200 hover:border-green-400 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mr-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                Proposals
              </h3>
              <p className="text-base lg:text-lg text-gray-700 mb-6 leading-relaxed">
                Winning business proposals and project pitches.
              </p>
              <Link to="/templates" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-2 py-1">
                Browse templates
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Templates Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 lg:py-32" aria-labelledby="popular-templates-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 lg:mb-16 gap-6">
            <h2 id="popular-templates-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Popular Templates
            </h2>
            <Link to="/templates" className="inline-flex items-center text-lg lg:text-xl font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-3 py-2">
              View all templates
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Template Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : popularTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {popularTemplates.map((template, index) => {
                // Define gradient colors for each card
                const gradients = [
                  'from-green-300 via-emerald-300 to-teal-400',
                  'from-blue-300 via-indigo-300 to-purple-400',
                  'from-orange-300 via-red-300 to-pink-400'
                ];
                const hoverColors = [
                  'group-hover:text-green-700',
                  'group-hover:text-purple-700',
                  'group-hover:text-red-700'
                ];
                
                return (
                  <article key={template.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200">
                    <div className={`relative h-48 lg:h-56 bg-gradient-to-br ${gradients[index % 3]} overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      
                      {/* Template Preview Image */}
                      {template.images && template.images.length > 0 ? (
                        <img
                          src={template.images[0]}
                          alt={`${template.title} preview`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient if preview fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        /* Default fallback when no preview images available */
                        <div className="absolute inset-4 bg-white rounded-lg shadow-inner p-8 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <div className="text-lg font-bold text-gray-400">No Preview</div>
                            <div className="text-sm text-gray-500">{template.title}</div>
                          </div>
                        </div>
                      )}
                      
                      {template.price > 0 && (
                        <div className="absolute top-4 left-4 bg-yellow-400/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-semibold text-gray-900">Premium</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-700">
                          {template.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 lg:p-8">
                      <h3 className={`font-krub text-lg lg:text-xl font-bold text-gray-900 mb-3 ${hoverColors[index % 3]} transition-colors duration-300`}>
                        {template.title || 'Untitled Template'}
                      </h3>
                      <p className="font-krub text-sm lg:text-base text-gray-600 mb-6 leading-relaxed line-clamp-2">
                        {template.description || 'No description available'}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col space-y-1">
                          {(() => {
                            const name = template.author?.username || 'Unknown Author';
                            const isAdminAuthor = /admin/i.test(name);
                            return (
                              <span className={`text-xs ${isAdminAuthor ? 'text-white bg-gray-900 px-2 py-0.5 rounded-md' : 'text-gray-500'}`}>
                                {isAdminAuthor ? 'By ADMIN' : `by ${name}`}
                              </span>
                            );
                          })()}
                          <span className="font-bold text-gray-900">
                            {template.price === 0 ? (
                              <span className="text-green-600">Free</span>
                            ) : (
                              `${template.price.toLocaleString('vi-VN')} đ`
                            )}
                          </span>
                        </div>
                        <Link to={`/templates/${template.id}`} className="inline-flex items-center font-krub text-sm lg:text-base font-semibold text-green-600 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 rounded-lg px-3 py-2">
                          Use template
                          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No popular templates available at the moment</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
