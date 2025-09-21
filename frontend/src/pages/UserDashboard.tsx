import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { SavedCurriculumCard } from '../components/user/SavedCurriculumCard';
import { AccountSettings } from '../components/user/AccountSettings';
import ErrorBoundary from '../components/ErrorBoundary';

interface SavedCurriculum {
  id: string;
  personalNotes: string | null;
  savedAt: string;
  curriculum: {
    id: string;
    name: string;
    publisher: string;
    description: string;
    imageUrl?: string;
    overallRating: number;
    gradeLevel: {
      name: string;
    };
    subjects: Array<{
      name: string;
    }>;
    teachingApproachStyle: string;
    costPriceRange: string;
    timeCommitmentDailyMinutes: number;
  };
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'settings'>('saved');
  const [savedCurricula, setSavedCurricula] = useState<SavedCurriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect admin users to admin panel
  if (user?.role === 'admin') {
    console.log('🔄 Redirecting admin user to admin panel');
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    console.log('🔍 UserDashboard mounted, user:', user);
    console.log('👤 User firstName:', user?.firstName);
    console.log('🎭 User role:', user?.role);
    
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchSavedCurricula();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchSavedCurricula = async () => {
    try {
      console.log('📡 Fetching saved curricula...');
      setIsLoading(true);
      setError(null);
      
      const response = await api.getSavedCurricula();
      console.log('📊 API response:', response);
      
      // Defensive programming - check response structure
      if (!response || !response.data) {
        throw new Error('Invalid API response structure');
      }
      
      const curricula = response.data.savedCurricula || [];
      console.log('📚 Saved curricula data:', curricula);
      console.log('📊 Curricula count:', curricula.length);
      
      // Validate each curriculum object
      const validCurricula = curricula.filter((item: any) => {
        if (!item || !item.curriculum) {
          console.warn('⚠️ Invalid curriculum item:', item);
          return false;
        }
        return true;
      });
      
      console.log('✅ Valid curricula:', validCurricula.length);
      setSavedCurricula(validCurricula);
      
    } catch (error) {
      console.error('❌ Failed to fetch saved curricula:', error);
      setError(`Failed to load saved curricula: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCurriculum = (savedId: string) => {
    setSavedCurricula(prev => prev.filter(item => item.id !== savedId));
  };

  const handleNotesUpdate = (savedId: string, notes: string) => {
    setSavedCurricula(prev =>
      prev.map(item =>
        item.id === savedId
          ? { ...item, personalNotes: notes }
          : item
      )
    );
  };

  const tabs = [
    { id: 'saved', label: 'Saved Curricula', count: savedCurricula.length },
    { id: 'settings', label: 'Account Settings' },
  ];

  try {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your saved curricula and account settings
            </p>
          </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'saved' | 'settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'saved' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Saved Curricula
              </h2>
              {savedCurricula.length > 0 && (
                <p className="text-sm text-gray-600">
                  {savedCurricula.length} curriculum{savedCurricula.length !== 1 ? 'a' : ''} saved
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading your saved curricula...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : savedCurricula.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No saved curricula yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start exploring curricula and save the ones you're interested in!
                </p>
                <a
                  href="/browse"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Curricula
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {savedCurricula.map((savedCurriculum) => {
                  try {
                    return (
                      <SavedCurriculumCard
                        key={savedCurriculum.id}
                        savedCurriculum={savedCurriculum}
                        onRemove={handleRemoveCurriculum}
                        onNotesUpdate={handleNotesUpdate}
                      />
                    );
                  } catch (error) {
                    console.error('❌ Error rendering SavedCurriculumCard:', error, savedCurriculum);
                    return (
                      <div key={savedCurriculum.id} className="bg-red-50 border border-red-200 p-4 rounded-md">
                        <p className="text-red-700">Error loading curriculum: {savedCurriculum.curriculum?.name || 'Unknown'}</p>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}

          {activeTab === 'settings' && <AccountSettings />}
          </div>
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ UserDashboard render error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">Something went wrong loading the dashboard.</p>
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

export default UserDashboard;