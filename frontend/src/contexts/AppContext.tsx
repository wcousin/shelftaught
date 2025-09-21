import React, { createContext, useContext, useReducer } from 'react';

// Types
interface Curriculum {
  id: string;
  name: string;
  publisher: string;
  description: string;
  overallRating: number;
  imageUrl?: string;
  subjects: string[];
  gradeRange: string;
}

interface AppState {
  curricula: Curriculum[];
  savedCurricula: string[];
  searchQuery: string;
  filters: {
    subjects: string[];
    gradeLevel: string[];
    teachingApproach: string[];
    priceRange: string[];
  };
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_CURRICULA'; payload: Curriculum[] }
  | { type: 'SET_SAVED_CURRICULA'; payload: string[] }
  | { type: 'ADD_SAVED_CURRICULUM'; payload: string }
  | { type: 'REMOVE_SAVED_CURRICULUM'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<AppState['filters']> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

interface AppContextType extends AppState {
  setCurricula: (curricula: Curriculum[]) => void;
  setSavedCurricula: (savedIds: string[]) => void;
  addSavedCurriculum: (id: string) => void;
  removeSavedCurriculum: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Initial state
const initialState: AppState = {
  curricula: [],
  savedCurricula: [],
  searchQuery: '',
  filters: {
    subjects: [],
    gradeLevel: [],
    teachingApproach: [],
    priceRange: [],
  },
  isLoading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRICULA':
      return {
        ...state,
        curricula: action.payload,
      };
    case 'SET_SAVED_CURRICULA':
      return {
        ...state,
        savedCurricula: action.payload,
      };
    case 'ADD_SAVED_CURRICULUM':
      return {
        ...state,
        savedCurricula: [...state.savedCurricula, action.payload],
      };
    case 'REMOVE_SAVED_CURRICULUM':
      return {
        ...state,
        savedCurricula: state.savedCurricula.filter(id => id !== action.payload),
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setCurricula = (curricula: Curriculum[]) => {
    dispatch({ type: 'SET_CURRICULA', payload: curricula });
  };

  const setSavedCurricula = (savedIds: string[]) => {
    dispatch({ type: 'SET_SAVED_CURRICULA', payload: savedIds });
  };

  const addSavedCurriculum = (id: string) => {
    dispatch({ type: 'ADD_SAVED_CURRICULUM', payload: id });
  };

  const removeSavedCurriculum = (id: string) => {
    dispatch({ type: 'REMOVE_SAVED_CURRICULUM', payload: id });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters: Partial<AppState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AppContextType = {
    ...state,
    setCurricula,
    setSavedCurricula,
    addSavedCurriculum,
    removeSavedCurriculum,
    setSearchQuery,
    setFilters,
    setLoading,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};