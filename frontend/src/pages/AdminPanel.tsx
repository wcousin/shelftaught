import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CurriculumManagement from '../components/admin/CurriculumManagement';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ContentModeration from '../components/admin/ContentModeration';
import ErrorBoundary from '../components/ErrorBoundary';

type AdminTab = 'curricula' | 'users' | 'analytics' | 'moderation';

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('curricula');

  console.log('🔍 AdminPanel - Auth state:', { user, isAuthenticated });
  console.log('🔍 AdminPanel - User role:', user?.role);
  console.log('🔍 AdminPanel - Active tab:', activeTab);

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'ADMIN')) {
    console.log('🔄 AdminPanel - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'curricula' as AdminTab, label: 'Curriculum Management', icon: '📚' },
    { id: 'users' as AdminTab, label: 'User Management', icon: '👥' },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: '📊' },
    { id: 'moderation' as AdminTab, label: 'Content Moderation', icon: '🛡️' }
  ];

  const renderActiveTab = () => {
    console.log('🔍 AdminPanel - Rendering tab:', activeTab);
    try {
      switch (activeTab) {
        case 'curricula':
          return (
            <ErrorBoundary>
              <CurriculumManagement />
            </ErrorBoundary>
          );
        case 'users':
          return (
            <ErrorBoundary>
              <UserManagement />
            </ErrorBoundary>
          );
        case 'analytics':
          return (
            <ErrorBoundary>
              <AnalyticsDashboard />
            </ErrorBoundary>
          );
        case 'moderation':
          return (
            <ErrorBoundary>
              <ContentModeration />
            </ErrorBoundary>
          );
        default:
          return (
            <ErrorBoundary>
              <CurriculumManagement />
            </ErrorBoundary>
          );
      }
    } catch (error) {
      console.error('❌ AdminPanel - Error rendering tab:', error);
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Component</h3>
          <p className="text-gray-600">There was an error loading this admin component.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };

  try {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage curricula, users, and site content
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.firstName}</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderActiveTab()}
          </div>
        </div>
      </div>
      </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ AdminPanel - Critical error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Panel Error</h1>
          <p className="text-gray-600 mb-4">Something went wrong loading the admin panel.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default AdminPanel;