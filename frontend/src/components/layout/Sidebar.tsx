import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface FilterOption {
  id: string;
  name: string;
  count: number;
}

interface FilterState {
  gradeLevels: string[];
  subjects: string[];
  teachingApproaches: string[];
  priceRanges: string[];
  availability: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
  searchQuery?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onFiltersChange,
  className = "",
  searchQuery = ""
}) => {
  const [filters, setFilters] = useState<FilterState>({
    gradeLevels: [],
    subjects: [],
    teachingApproaches: [],
    priceRanges: [],
    availability: []
  });

  const [filterOptions, setFilterOptions] = useState({
    gradeLevels: [] as FilterOption[],
    subjects: [] as FilterOption[],
    teachingApproaches: [] as FilterOption[],
    priceRanges: [] as FilterOption[],
    availability: [] as FilterOption[]
  });

  const [loading, setLoading] = useState(false);

  // Fetch dynamic filter counts from API
  useEffect(() => {
    const fetchFilterCounts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('q', searchQuery);
        }
        
        const response = await api.getSearchFilters(searchQuery);
        if (response.status === 200) {
          const filtersData = response.data.data?.filters || {};
          
          setFilterOptions({
            gradeLevels: filtersData.gradeLevels || [],
            subjects: filtersData.subjects || [],
            teachingApproaches: filtersData.teachingApproaches || [],
            priceRanges: filtersData.costRanges || [],
            availability: filtersData.availability || []
          });
        } else {
          // Fallback to mock data if API fails
          setFilterOptions({
            gradeLevels: [
              { id: 'preschool', name: 'Preschool (Ages 3-5)', count: 45 },
              { id: 'elementary', name: 'Elementary (K-5)', count: 128 },
              { id: 'middle', name: 'Middle School (6-8)', count: 89 },
              { id: 'high', name: 'High School (9-12)', count: 156 }
            ],
            subjects: [
              { id: 'math', name: 'Mathematics', count: 87 },
              { id: 'language-arts', name: 'Language Arts', count: 92 },
              { id: 'science', name: 'Science', count: 76 },
              { id: 'history', name: 'History & Social Studies', count: 64 }
            ],
            teachingApproaches: [
              { id: 'traditional', name: 'Traditional', count: 156 },
              { id: 'charlotte-mason', name: 'Charlotte Mason', count: 43 },
              { id: 'unit-studies', name: 'Unit Studies', count: 67 }
            ],
            priceRanges: [
              { id: 'free', name: 'Free', count: 23 },
              { id: 'under-50', name: 'Under $50', count: 89 },
              { id: '50-100', name: '$50 - $100', count: 134 }
            ],
            availability: []
          });
        }
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterCounts();
  }, [searchQuery]);

  const handleFilterChange = (category: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [category]: checked 
          ? [...prev[category], value]
          : prev[category].filter(item => item !== value)
      };
      
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      gradeLevels: [],
      subjects: [],
      teachingApproaches: [],
      priceRanges: [],
      availability: []
    };
    setFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0);
  };

  const FilterSection: React.FC<{
    title: string;
    options: FilterOption[];
    selectedValues: string[];
    category: keyof FilterState;
  }> = ({ title, options, selectedValues, category }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map(option => (
          <label key={option.id} className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={(e) => handleFilterChange(category, option.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {option.name}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {option.count}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none md:border-r md:w-64
        ${className}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b md:border-b-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              )}
              <button 
                onClick={onClose} 
                className="md:hidden text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filterOptions.gradeLevels.length > 0 && (
                  <FilterSection
                    title="Grade Level"
                    options={filterOptions.gradeLevels}
                    selectedValues={filters.gradeLevels}
                    category="gradeLevels"
                  />
                )}
                
                {filterOptions.subjects.length > 0 && (
                  <FilterSection
                    title="Subject"
                    options={filterOptions.subjects}
                    selectedValues={filters.subjects}
                    category="subjects"
                  />
                )}
                
                {filterOptions.teachingApproaches.length > 0 && (
                  <FilterSection
                    title="Teaching Approach"
                    options={filterOptions.teachingApproaches}
                    selectedValues={filters.teachingApproaches}
                    category="teachingApproaches"
                  />
                )}
                
                {filterOptions.priceRanges.length > 0 && (
                  <FilterSection
                    title="Price Range"
                    options={filterOptions.priceRanges}
                    selectedValues={filters.priceRanges}
                    category="priceRanges"
                  />
                )}
                
                {filterOptions.availability.length > 0 && (
                  <FilterSection
                    title="Availability"
                    options={filterOptions.availability}
                    selectedValues={filters.availability}
                    category="availability"
                  />
                )}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              Showing curricula matching your selected filters
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;