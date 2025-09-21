import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import SearchBar from '../components/forms/SearchBar';
import CurriculumCard from '../components/curriculum/CurriculumCard';
import { api } from '../services/api';
import type { Curriculum, SearchParams } from '../types';

interface FilterState {
  gradeLevels: string[];
  subjects: string[];
  teachingApproaches: string[];
  priceRanges: string[];
  availability: string[];
}

interface SearchPageProps {
  onFiltersChange?: (filters: FilterState) => void;
  searchQuery?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ onFiltersChange, searchQuery: propSearchQuery }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = propSearchQuery || searchParams.get('q') || '';
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'publisher' | 'createdAt' | 'popularity' | 'cost' | 'relevance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    gradeLevels: [],
    subjects: [],
    teachingApproaches: [],
    priceRanges: [],
    availability: []
  });

  const itemsPerPage = 12;

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sortBy') as 'rating' | 'name' | 'publisher' | 'createdAt' || 'rating';
    const order = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    
    setCurrentPage(page);
    setSortBy(sort);
    setSortOrder(order);
  }, [searchParams]);

  const performSearch = async (searchQuery: string = query, filters: FilterState = currentFilters) => {
    if (!searchQuery.trim()) {
      setCurricula([]);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params: SearchParams = {
        q: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
        gradeLevel: filters.gradeLevels.length > 0 ? filters.gradeLevels : undefined,
        teachingApproach: filters.teachingApproaches.length > 0 ? filters.teachingApproaches : undefined,
        priceRange: filters.priceRanges.length > 0 ? filters.priceRanges : undefined,
        availability: filters.availability.length > 0 ? filters.availability : undefined,
      };

      const response = await api.searchCurricula(searchQuery, params);
      setCurricula(response.data.data || []);
      setTotalCount(response.data.total || 0);
    } catch (err) {
      console.error('Error searching curricula:', err);
      setError('Failed to search curricula');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentPage, sortBy, sortOrder]);

  const handleSearch = (newQuery: string) => {
    setCurrentPage(1);
    setSearchParams({ q: newQuery, page: '1', sortBy, sortOrder });
  };

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
    setSearchParams({ q: query, page: '1', sortBy, sortOrder });
    performSearch(query, filters);
    
    // Call parent's onFiltersChange if provided
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setSearchParams({ 
      q: query,
      page: currentPage.toString(), 
      sortBy: newSortBy, 
      sortOrder: newSortOrder 
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ 
      q: query,
      page: page.toString(), 
      sortBy, 
      sortOrder 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCurriculumClick = (id: string) => {
    navigate(`/curriculum/${id}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for curricula, subjects, or publishers..."
            className="max-w-2xl"
            initialValue={query}
          />
        </div>
        
        {query && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-gray-600">
                Showing results for: <span className="font-semibold">"{query}"</span>
              </p>
              {!loading && (
                <p className="text-sm text-gray-500">
                  {totalCount} {totalCount === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>
            
            {curricula.length > 0 && (
              <div className="mt-4 sm:mt-0">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                    handleSortChange(newSortBy, newSortOrder);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {query && <option value="relevance-desc">Most Relevant</option>}
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="popularity-desc">Most Popular</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="publisher-asc">Publisher A-Z</option>
                  <option value="cost-asc">Price: Low to High</option>
                  <option value="cost-desc">Price: High to Low</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Start your search</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a search term to find curricula that match your needs.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => performSearch()}
              className="mt-2 text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading && query && (
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

        {!loading && !error && query && curricula.length > 0 && (
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
                  subjects={curriculum.subjectsCovered.subjects}
                  gradeRange={curriculum.targetAgeGrade.gradeRange}
                  onClick={() => handleCurriculumClick(curriculum.id)}
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

        {!loading && !error && query && curricula.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try different keywords or adjust your filters.
              </p>
            </div>
          </div>
        )}
      </div>
  );
};

export default SearchPage;