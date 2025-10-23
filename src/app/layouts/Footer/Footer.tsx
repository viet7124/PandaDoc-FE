import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2C373B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="font-krub text-2xl lg:text-3xl font-bold mb-4">
              PandaDocs
            </h3>
            <p className="font-krub text-xl lg:text-2xl font-bold mb-8">
              Professional study template for Vietnamese students
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">About</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="font-krub text-xl hover:text-green-400 transition-colors">About us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="font-krub text-xl hover:text-green-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-krub text-2xl font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="font-krub text-xl hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="font-krub text-xl hover:text-green-400 transition-colors">Terms of Service</Link></li>
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
