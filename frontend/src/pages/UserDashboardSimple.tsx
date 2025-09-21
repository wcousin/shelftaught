import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserDashboardSimple: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  console.log('🔍 Simple Dashboard - Auth state:', { user, isAuthenticated });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Simple Dashboard Test
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            <p><strong>Current URL:</strong> {window.location.href}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Test Content</h3>
            <p>If you can see this, the basic dashboard is working.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardSimple;