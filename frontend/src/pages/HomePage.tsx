import React, { useState, useEffect } from 'react';

import SearchBar from '../components/forms/SearchBar';
import CurriculumCard from '../components/curriculum/CurriculumCard';
import LazyCurriculumCard from '../components/curriculum/LazyCurriculumCard';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCurricula, setFeaturedCurricula] = useState<CurriculumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCurricula = async () => {
      try {
        console.log('🏠 HomePage: Starting to fetch curricula...');
        setLoading(true);
        setError(null);
        
        const response = await api.getCurricula({ 
          limit: 6, 
          sortBy: 'overallRating', 
          sortOrder: 'desc' 
        });
        
        console.log('🏠 HomePage: API response received:', response);
        console.log('🏠 HomePage: Response data:', response.data);
        console.log('🏠 HomePage: Response data.data:', response.data.data);
        console.log('🏠 HomePage: Curricula array:', response.data.data?.curricula);
        console.log('🏠 HomePage: Curricula length:', response.data.data?.curricula?.length);
        
        const curricula = response.data.data?.curricula || [];
        console.log('🏠 HomePage: Setting curricula state:', curricula);
        setFeaturedCurricula(curricula);
        
        console.log('🏠 HomePage: State should be updated with', curricula.length, 'curricula');
      } catch (err) {
        console.error('🏠 HomePage: Error fetching featured curricula:', err);
        setError('Failed to load featured curricula');
      } finally {
        console.log('🏠 HomePage: Setting loading to false');
        setLoading(false);
      }
    };

    fetchFeaturedCurricula();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCurriculumClick = (curriculum: CurriculumListItem) => {
    const url = createCurriculumUrl(curriculum.id, curriculum.name, curriculum.publisher);
    navigate(url);
  };

  return (
    <>
      <SEO
        title="Shelf Taught - Homeschool Curriculum Reviews & Ratings"
        description="Find the perfect homeschool curriculum with detailed reviews and ratings. Compare teaching approaches, subjects, costs, and more to make informed educational decisions."
        url="https://shelftaught.com"
        keywords="homeschool curriculum, curriculum reviews, homeschool ratings, educational materials, teaching resources"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Find the Perfect Homeschool Curriculum
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Discover comprehensive reviews and ratings to help you choose the best educational materials for your children.
          </p>
          
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search for curricula, subjects, or publishers..."
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center px-4">
            <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Search & Filter</h3>
            <p className="text-sm sm:text-base text-gray-600">Find curricula by subject, grade level, teaching approach, and more.</p>
          </div>

          <div className="text-center px-4">
            <div className="bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Save Favorites</h3>
            <p className="text-sm sm:text-base text-gray-600">Create your personal list of curricula to compare and consider.</p>
          </div>
          
          <div className="text-center px-4">
            <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Take Notes</h3>
            <p className="text-sm sm:text-base text-gray-600">Add personal notes and thoughts to your saved curricula for easy reference.</p>
          </div>
        
        </div>

        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Featured Curricula</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Explore some of our most popular and highly-rated curriculum options.
          </p>
          
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-md mb-3 sm:mb-4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && featuredCurricula.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {featuredCurricula.map((curriculum, index) => (
                // Use lazy loading for cards below the fold (after first 3)
                index < 3 ? (
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
                ) : (
                  <LazyCurriculumCard
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
                )
              ))}
            </div>
          )}

          {!loading && !error && featuredCurricula.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No curricula available at the moment.</p>
            </div>
          )}
          
          <div className="text-center">
            <button 
              onClick={() => navigate('/browse')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors touch-manipulation text-sm sm:text-base"
            >
              Browse All Curricula
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;