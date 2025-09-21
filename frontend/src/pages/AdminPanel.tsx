import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import CurriculumManagement from '../components/admin/CurriculumManagement';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import ContentModeration from '../components/admin/ContentModeration';

type AdminTab = 'curricula' | 'users' | 'analytics' | 'moderation';

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('curricula');

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'curricula' as AdminTab, label: 'Curriculum Management', icon: '📚' },
    { id: 'users' as AdminTab, label: 'User Management', icon: '👥' },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: '📊' },
    { id: 'moderation' as AdminTab, label: 'Content Moderation', icon: '🛡️' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'curricula':
        return <CurriculumManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'moderation':
        return <ContentModeration />;
      default:
        return <CurriculumManagement />;
    }
  };

  return (
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
  );
};

export default AdminPanel;