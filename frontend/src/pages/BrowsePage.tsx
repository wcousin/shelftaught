import React, { useState, useEffect } from 'react';

import CurriculumCard from '../components/curriculum/CurriculumCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { SearchParams } from '../types';
import { createCurriculumUrl } from '../utils/url';

// API response structure (different from detailed Curriculum type)
interface CurriculumListItem {
  id: string;
  name: string;
  publisher: string;
  description: string;
  imageUrl?: string;
  gradeLevel: {
    id: string;
    name: string;
    ageRange: string;
  };
  subjects: Array<{
    id: string;
    name: string;
  }>;
  teachingApproach: {
    style: string;
    rating: number;
  };
  cost: {
    priceRange: string;
    rating: number;
  };
  overallRating: number;
  reviewCount: number;
  createdAt: string;
}

interface FilterState {
  gradeLevels: string[];
  subjects: string[];
  teachingApproaches: string[];
  priceRanges: string[];
}

interface BrowsePageProps {
  onFiltersChange?: (filters: FilterState) => void;
}

const BrowsePage: React.FC<BrowsePageProps> = ({ onFiltersChange }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [curricula, setCurricula] = useState<CurriculumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'publisher' | 'createdAt'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 12;

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sortBy') as 'rating' | 'name' | 'publisher' | 'createdAt' || 'rating';
    const order = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    
    setCurrentPage(page);
    setSortBy(sort);
    setSortOrder(order);
  }, [searchParams]);

  const fetchCurricula = async (filters: FilterState = { gradeLevels: [], subjects: [], teachingApproaches: [], priceRanges: [] }) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: SearchParams = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
        gradeLevel: filters.gradeLevels.length > 0 ? filters.gradeLevels : undefined,
        teachingApproach: filters.teachingApproaches.length > 0 ? filters.teachingApproaches : undefined,
        priceRange: filters.priceRanges.length > 0 ? filters.priceRanges : undefined,
      };

      const response = await api.getCurricula(params);
      setCurricula(response.data.data?.curricula || []);
      setTotalCount(response.data.data?.pagination?.totalCount || 0);
    } catch (err) {
      console.error('Error fetching curricula:', err);
      setError('Failed to load curricula');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula();
  }, [currentPage, sortBy, sortOrder]);

  // TODO: Connect to filter sidebar component
  // @ts-ignore - Function will be used when filter sidebar is implemented
  const handleFiltersChange = (filters: FilterState) => {
    setCurrentPage(1);
    setSearchParams({ page: '1', sortBy, sortOrder });
    fetchCurricula(filters);
    
    // Call parent's onFiltersChange if provided
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setSearchParams({ 
      page: currentPage.toString(), 
      sortBy: newSortBy, 
      sortOrder: newSortOrder 
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ 
      page: page.toString(), 
      sortBy, 
      sortOrder 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurriculumClick = (curriculum: CurriculumListItem) => {
    const url = createCurriculumUrl(curriculum.id, curriculum.name, curriculum.publisher);
    navigate(url);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Curricula</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `Showing ${curricula.length} of ${totalCount} curricula`}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                handleSortChange(newSortBy, newSortOrder);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="publisher-asc">Publisher A-Z</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchCurricula()}
              className="mt-2 text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && curricula.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {curricula.map((curriculum) => (
                <CurriculumCard
                  key={curriculum.id}
                  id={curriculum.id}
                  name={curriculum.name}
                  publisher={curriculum.publisher}
                  description={curriculum.description}
                  overallRating={curriculum.overallRating}
                  imageUrl={curriculum.imageUrl}
                  subjects={curriculum.subjects.map(s => s.name)}
                  gradeRange={curriculum.gradeLevel.ageRange}
                  onClick={() => handleCurriculumClick(curriculum)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = Math.max(1, currentPage - 2) + index;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNumber === currentPage
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && curricula.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No curricula found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          </div>
        )}
      </div>
  );
};

export default BrowsePage;