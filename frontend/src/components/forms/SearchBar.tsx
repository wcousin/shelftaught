import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface SearchSuggestion {
  id: string;
  name: string;
  publisher: string;
  type: 'curriculum' | 'subject' | 'publisher' | 'approach';
  metadata?: {
    rating?: number;
    reviewCount?: number;
    curriculumCount?: number;
  };
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search curricula...",
  className = "",
  showSuggestions = true,
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search suggestions with real API integration
  useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([]);
      setShowSuggestionsList(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.getSearchSuggestions(query, 8);
        if (response.status === 200) {
          const apiSuggestions = response.data.data?.suggestions || [];
          
          // Transform API suggestions to component format
          const transformedSuggestions: SearchSuggestion[] = apiSuggestions.map((item: any) => ({
            id: item.id,
            name: item.text,
            publisher: item.subtitle || '',
            type: item.type as 'curriculum' | 'subject' | 'publisher'
          }));

          setSuggestions(transformedSuggestions);
          setShowSuggestionsList(transformedSuggestions.length > 0);
        } else {
          // Fallback to mock data if API fails
          const mockSuggestions: SearchSuggestion[] = [
            { id: '1', name: 'Saxon Math', publisher: 'Saxon Publishers', type: 'curriculum' as const },
            { id: '2', name: 'Teaching Textbooks', publisher: 'Teaching Textbooks', type: 'curriculum' as const },
            { id: '3', name: 'Math-U-See', publisher: 'Math-U-See', type: 'curriculum' as const },
            { id: '4', name: 'Mathematics', publisher: '', type: 'subject' as const },
          ].filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.publisher.toLowerCase().includes(query.toLowerCase())
          );

          setSuggestions(mockSuggestions);
          setShowSuggestionsList(mockSuggestions.length > 0);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Fallback to empty suggestions on error
        setSuggestions([]);
        setShowSuggestionsList(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, showSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestionsList(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestionsList(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestionsList(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'curriculum':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'subject':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'approach':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'publisher':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatSuggestionMetadata = (suggestion: SearchSuggestion) => {
    if (!suggestion.metadata) return null;
    
    if (suggestion.type === 'curriculum' && suggestion.metadata.rating) {
      return (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{suggestion.metadata.rating.toFixed(1)}</span>
          {suggestion.metadata.reviewCount && (
            <span>({suggestion.metadata.reviewCount})</span>
          )}
        </div>
      );
    }
    
    if (suggestion.type === 'subject' && suggestion.metadata.curriculumCount) {
      return (
        <span className="text-xs text-gray-500">
          {suggestion.metadata.curriculumCount} curricula
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-8 sm:pl-10 pr-10 sm:pr-12 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          >
            {isLoading ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 touch-manipulation ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  <div className="flex items-center justify-between">
                    {suggestion.publisher && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.publisher}
                      </div>
                    )}
                    {formatSuggestionMetadata(suggestion)}
                  </div>
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {suggestion.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;