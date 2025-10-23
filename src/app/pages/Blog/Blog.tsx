import { useState, useMemo } from 'react';
import { Search, Calendar, Clock, User, ArrowRight, TrendingUp, BookOpen, Lightbulb, FileText } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
}

const categories = ['All', 'Templates', 'Business Tips', 'Productivity', 'Design', 'Industry Insights'];

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Essential Business Templates Every Startup Needs",
    excerpt: "Starting a business? These essential templates will help you stay organized and professional from day one.",
    content: "Full article content...",
    author: "Sarah Johnson",
    date: "2024-10-15",
    readTime: "5 min read",
    category: "Templates",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "How to Create Professional Documents That Stand Out",
    excerpt: "Learn the secrets of document design that will make your business materials memorable and effective.",
    content: "Full article content...",
    author: "Michael Chen",
    date: "2024-10-12",
    readTime: "7 min read",
    category: "Design",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop"
  },
  {
    id: 3,
    title: "Boost Your Productivity with Document Automation",
    excerpt: "Discover how automating your document workflow can save hours every week and reduce errors.",
    content: "Full article content...",
    author: "Emily Rodriguez",
    date: "2024-10-10",
    readTime: "6 min read",
    category: "Productivity",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop"
  },
  {
    id: 4,
    title: "The Ultimate Guide to Business Proposals",
    excerpt: "Master the art of writing winning business proposals with our comprehensive guide and templates.",
    content: "Full article content...",
    author: "David Thompson",
    date: "2024-10-08",
    readTime: "10 min read",
    category: "Business Tips",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"
  },
  {
    id: 5,
    title: "Top Document Design Trends for 2024",
    excerpt: "Stay ahead of the curve with these cutting-edge design trends that are shaping business documents.",
    content: "Full article content...",
    author: "Jessica Lee",
    date: "2024-10-05",
    readTime: "8 min read",
    category: "Design",
    image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=500&fit=crop"
  },
  {
    id: 6,
    title: "How Templates Can Save Your Business Time and Money",
    excerpt: "Calculate the real ROI of using professional templates versus creating documents from scratch.",
    content: "Full article content...",
    author: "Robert Martinez",
    date: "2024-10-03",
    readTime: "5 min read",
    category: "Business Tips",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop"
  },
  {
    id: 7,
    title: "Creating Consistent Brand Documents",
    excerpt: "Learn how to maintain brand consistency across all your business documents and communications.",
    content: "Full article content...",
    author: "Amanda Foster",
    date: "2024-10-01",
    readTime: "6 min read",
    category: "Design",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop"
  },
  {
    id: 8,
    title: "The Future of Digital Documentation",
    excerpt: "Explore emerging technologies and trends that are revolutionizing how we create and share documents.",
    content: "Full article content...",
    author: "Kevin Park",
    date: "2024-09-28",
    readTime: "9 min read",
    category: "Industry Insights",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop"
  },
  {
    id: 9,
    title: "5 Productivity Hacks for Document Management",
    excerpt: "Simple yet powerful strategies to organize and manage your documents more efficiently.",
    content: "Full article content...",
    author: "Lisa Wang",
    date: "2024-09-25",
    readTime: "4 min read",
    category: "Productivity",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop"
  }
];

const categoryIcons: Record<string, JSX.Element> = {
  'Templates': <FileText className="w-5 h-5" />,
  'Business Tips': <TrendingUp className="w-5 h-5" />,
  'Productivity': <Clock className="w-5 h-5" />,
  'Design': <Lightbulb className="w-5 h-5" />,
  'Industry Insights': <BookOpen className="w-5 h-5" />
};

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              PandaDocs Blog
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-8">
              Insights, tips, and best practices for creating better documents
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl text-gray-900 bg-white border-2 border-white placeholder-gray-500 font-medium focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-white shadow-2xl hover:shadow-3xl transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'All' && searchQuery === '' && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Article</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 hover:text-green-600 transition-colors cursor-pointer">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
          </h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No articles found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1.5">
                        {categoryIcons[post.category]}
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <button className="text-green-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest insights delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 border-0 focus:outline-none focus:ring-4 focus:ring-green-300/50"
            />
            <button className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}