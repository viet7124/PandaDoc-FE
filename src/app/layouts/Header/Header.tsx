import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import avatarImage from "../../assets/avatar.png";
import { addRoleChangeListener } from "../../utils/roleEvents";
import { getCurrentUser, getAvatarUrl } from "../../pages/Profile/services/authAPI";
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSeller, setIsSeller] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [language] = useState<string>(localStorage.getItem('lang') || 'en');
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is a seller
  useEffect(() => {
    // Utility to check both storage types for userRoles
    const checkSellerStatus = () => {
      let userRoles: string[] = [];
      try {
        userRoles = JSON.parse(sessionStorage.getItem('userRoles') || localStorage.getItem('userRoles') || '[]');
      } catch {
        userRoles = [];
      }
      setIsSeller(userRoles.includes('ROLE_SELLER'));
    };

    checkSellerStatus();
    
    // Listen for role changes (e.g., when user registers as seller or logs in)
    const removeListener = addRoleChangeListener(checkSellerStatus);
    
    return () => {
      removeListener();
    };
  }, []);

  // Load avatar function
  const loadAvatar = async () => {
    try {
      // Optimistic load from cached localStorage/sessionStorage user first
      try {
        const cached = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (cached) {
          const u = JSON.parse(cached);
          const cachedUrl = getAvatarUrl(u.avatar);
          if (cachedUrl) setAvatarUrl(cachedUrl);
        }
      } catch (e) {
        console.error('Error loading avatar:', e);
      }

      // Then fetch fresh profile to ensure latest avatar
      const data = await getCurrentUser();
      const freshUrl = getAvatarUrl(data.avatar);
      if (freshUrl) {
        setAvatarUrl(freshUrl);
      } else {
        setAvatarUrl(undefined); // Clear if no avatar
      }
    } catch (e) {
      console.error('Error loading avatar:', e);
      // ignore, will fallback to icon
    }
  };

  // Load avatar when header mounts
  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) loadAvatar();
  }, []);

  // Listen for avatar updates from Profile page
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const newAvatar = event.detail?.avatar;
      if (newAvatar) {
        const url = getAvatarUrl(newAvatar);
        setAvatarUrl(url || undefined);
      } else {
        loadAvatar(); // Reload from API to get fresh data
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Apply selected language to <html lang>
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRoles');
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/home">
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-white text-xl font-bold"><img src={avatarImage} alt="logo" className="w-10 h-10 rounded-full object-cover" /></span>
              </div>
              <span className="font-krub text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                PANDADOCS
              </span>
            </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/templates" 
              className="px-4 py-2 font-krub text-base lg:text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
            >
              Templates
            </Link>
            <Link 
              to="/profile?view=library" 
              className="px-4 py-2 font-krub text-base lg:text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
            >
              My Library
            </Link>
            {isSeller ? (
              <Link 
                to="/seller-profile" 
                className="px-4 py-2 font-krub text-base lg:text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              >
                Seller Dashboard
              </Link>
            ) : (
              <Link 
                to="/seller-register" 
                className="px-4 py-2 font-krub text-base lg:text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              >
                Become a Seller
              </Link>
            )}
            <Link 
              to="/blog" 
              className="px-4 py-2 font-krub text-base lg:text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
            >
              Blog
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Bar - Desktop */}
            <div className="hidden xl:flex items-center">
              <div className="relative">
                <label htmlFor="header-search" className="sr-only">Search templates</label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="header-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (searchQuery.trim()) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      } else {
                        // If search is empty, go to templates page
                        navigate('/templates');
                      }
                    }
                  }}
                  placeholder="business report"
                  className="w-72 pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Search Icon - Mobile/Tablet */}
            <button 
              onClick={() => {
                const query = prompt('Search templates:');
                if (query && query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              className="xl:hidden p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              aria-label="Search templates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User Avatar - Always visible with dropdown */}
            <div ref={profileMenuRef} className="hidden sm:block relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-0.5 rounded-full border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" onError={() => setAvatarUrl(undefined)} />
                ) : (
                  <User className="w-6 h-6 text-gray-700 m-1" />
                )}
              </button>
              
              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="py-4 space-y-2 border-t border-gray-200 mt-4">
            {/* Mobile Search */}
            <div className="px-2 pb-4">
              <label htmlFor="mobile-search" className="sr-only">Search templates</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="mobile-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  placeholder="Search templates..."
                  className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <Link 
              to="/templates" 
              className="block px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Templates
            </Link>
            <Link 
              to="/profile?view=library" 
              className="block px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Library
            </Link>
            {isSeller ? (
              <Link 
                to="/seller-profile" 
                className="block px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Seller Dashboard
              </Link>
            ) : (
              <Link 
                to="/seller-register" 
                className="block px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Become a Seller
              </Link>
            )}
            <Link 
              to="/blog" 
              className="block px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            
            {/* Mobile Profile & Logout */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-3 font-krub text-lg font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center px-4 py-3 font-krub text-lg font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
