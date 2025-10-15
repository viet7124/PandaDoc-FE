import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#2C373B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="font-krub text-2xl lg:text-3xl font-bold mb-4">
              PandaDocs
            </h3>
            <p className="font-krub text-xl lg:text-2xl font-bold mb-8">
              Professional study template for Vietnamese students
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-8">
              <div className="w-6 h-7 bg-white"></div>
              <div className="w-7 h-7 bg-white"></div>
              <div className="w-7 h-7 bg-white"></div>
              <div className="w-7 h-7 bg-white"></div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">About</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">About us</a></li>
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contributors & Legal */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Contributors</h4>
            <ul className="space-y-3 mb-8">
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Submit template</a></li>
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Guide</a></li>
            </ul>
            
            <h4 className="font-krub text-2xl font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white mt-16 pt-8">
          <p className="font-krub text-lg lg:text-xl font-bold text-center">
            © 2025 PandaDocs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
