import { Construction, Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Construction Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 animate-pulse"></div>
            <Construction className="w-32 h-32 text-green-600 relative animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          In Development
        </h1>
        
        <p className="text-xl text-gray-600 mb-2">
          This page is currently under construction
        </p>
        
        <p className="text-base text-gray-500 mb-12">
          We're working hard to bring you something amazing. Check back soon! 🚀
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/25 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Building something great...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
