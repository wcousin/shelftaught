import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 mt-8 pt-8 border-t border-gray-200 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Shelf Taught</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              Helping homeschooling families make informed curriculum decisions through comprehensive reviews and ratings. 
              Find the perfect educational materials for your child's learning journey.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.323 17.49c-.49-.49-.49-1.297 0-1.787l1.803-1.803c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323L3.323 5.451c-.49-.49-.49-1.297 0-1.787s1.297-.49 1.787 0l1.803 1.803c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297l1.803-1.803c.49-.49 1.297-.49 1.787 0s.49 1.297 0 1.787l-1.803 1.803c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323l1.803 1.803c.49.49.49 1.297 0 1.787s-1.297.49-1.787 0l-1.803-1.803c-.875.807-2.026 1.297-3.323 1.297z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Browse
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/browse" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  All Curricula
                </Link>
              </li>
              <li>
                <Link to="/browse?subject=math" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link to="/browse?subject=language-arts" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Language Arts
                </Link>
              </li>
              <li>
                <Link to="/browse?subject=science" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/browse?subject=history" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Advanced Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {currentYear} Shelf Taught. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <span className="text-sm text-gray-500">
                Made with ❤️ for homeschooling families
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;