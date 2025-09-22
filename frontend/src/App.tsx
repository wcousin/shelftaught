
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { optimizeForMobile, setupPWAInstallPrompt } from './utils/mobile';
import { Layout } from './components';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import CurriculumDetailPage from './pages/CurriculumDetailPage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import UserDashboardSimple from './pages/UserDashboardSimple';
import AdminPanel from './pages/AdminPanel';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Wrapper components for pages with sidebars
const BrowsePageWithLayout: React.FC = () => {
  const handleFiltersChange = (_filters: any) => {
    // This will be handled by the BrowsePage component itself
  };

  return (
    <Layout showSidebar={true} onFiltersChange={handleFiltersChange}>
      <BrowsePage onFiltersChange={handleFiltersChange} />
    </Layout>
  );
};

const SearchPageWithLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const handleFiltersChange = (_filters: any) => {
    // This will be handled by the SearchPage component itself
  };

  return (
    <Layout showSidebar={true} onFiltersChange={handleFiltersChange} searchQuery={query}>
      <SearchPage onFiltersChange={handleFiltersChange} searchQuery={query} />
    </Layout>
  );
};

function App() {
  useEffect(() => {
    // Initialize mobile optimizations
    optimizeForMobile();
    
    // Setup PWA install prompt
    setupPWAInstallPrompt();
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Layout>
                <HomePage />
              </Layout>
            } />
            <Route path="/browse" element={
              <BrowsePageWithLayout />
            } />
            <Route path="/search" element={
              <SearchPageWithLayout />
            } />
            <Route path="/curriculum/:id" element={
              <Layout>
                <CurriculumDetailPage />
              </Layout>
            } />
            <Route path="/compare" element={
              <Layout>
                <ComparisonPage />
              </Layout>
            } />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard-test" element={
              <UserDashboardSimple />
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
