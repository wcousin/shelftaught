import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import PWAInstallPrompt from '../PWAInstallPrompt';

interface FilterState {
  gradeLevels: string[];
  subjects: string[];
  teachingApproaches: string[];
  priceRanges: string[];
  availability: string[];
}

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  onFiltersChange?: (filters: FilterState) => void;
  searchQuery?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showSidebar = false,
  onFiltersChange,
  searchQuery = ""
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFiltersChange = (filters: FilterState) => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            onFiltersChange={handleFiltersChange}
            searchQuery={searchQuery}
          />
        )}
        
        <main className={`flex-1 ${showSidebar ? 'md:ml-0' : ''}`}>
          {showSidebar && (
            <div className="md:hidden p-4 bg-white border-b">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span>Filters</span>
              </button>
            </div>
          )}
          
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;