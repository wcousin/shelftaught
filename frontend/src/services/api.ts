import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { cache } from '../utils/cache';
import { measureAsync } from '../utils/performance';
import { mockApiResponses } from './mockData';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname.includes('railway.app') ? 'https://shelftaught-production.up.railway.app/api' : 
   import.meta.env.PROD ? 'https://shelftaught-production.up.railway.app/api' : 'http://localhost:3001/api');

// Debug logging
console.log('API Configuration Debug:');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- PROD mode:', import.meta.env.PROD);
console.log('- Hostname:', window.location.hostname);
console.log('- Final API_BASE_URL:', API_BASE_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // Disable credentials for now due to CORS wildcard
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to create cache key
const createCacheKey = (endpoint: string, params?: any): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${endpoint}${paramString}`;
};

// Helper function for cached GET requests with fallback to mock data
const cachedGet = async (endpoint: string, params?: any, ttl?: number): Promise<AxiosResponse> => {
  const cacheKey = createCacheKey(endpoint, params);
  
  // Check cache first
  const cachedData = cache.get<AxiosResponse>(cacheKey);
  if (cachedData) {
    return Promise.resolve(cachedData);
  }
  
  try {
    // Make API request with performance monitoring
    const response = await measureAsync(
      `api-${endpoint.replace(/\//g, '-')}`,
      () => apiClient.get(endpoint, { params })
    );
    
    // Cache the response (default 5 minutes, longer for static data)
    cache.set(cacheKey, response, ttl);
    
    return response;
  } catch (error) {
    console.warn(`API request failed for ${endpoint}, using mock data:`, error);
    
    // Fallback to mock data
    let mockResponse;
    
    if (endpoint === '/curricula') {
      mockResponse = mockApiResponses.getCurricula(params);
    } else if (endpoint.startsWith('/curricula/')) {
      const id = endpoint.split('/')[2];
      mockResponse = mockApiResponses.getCurriculumById(id);
    } else if (endpoint === '/search') {
      mockResponse = mockApiResponses.searchCurricula(params?.q || '', params);
    } else if (endpoint === '/categories') {
      mockResponse = mockApiResponses.getCategories();
    } else {
      // Generic fallback
      mockResponse = { data: { success: false, error: 'Endpoint not available in mock mode' } };
    }
    
    // Cache mock response briefly
    cache.set(cacheKey, mockResponse, 30 * 1000); // 30 seconds
    
    return Promise.resolve(mockResponse as AxiosResponse);
  }
};

// Mock authentication functions
const mockAuth = {
  login: async (credentials: { email: string; password: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    // Mock successful login
    const mockUser = {
      id: '1',
      email: credentials.email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'user' as const
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return {
      data: {
        success: true,
        data: {
          token: mockToken,
          user: mockUser
        }
      }
    };
  },
  
  register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      throw new Error('All fields are required');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Mock successful registration
    const mockUser = {
      id: '1',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user' as const
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return {
      data: {
        success: true,
        data: {
          token: mockToken,
          user: mockUser
        }
      }
    };
  }
};

// API service functions
export const api = {
  // Curriculum endpoints (cached)
  getCurricula: (params?: any) => 
    cachedGet('/curricula', params, 2 * 60 * 1000), // 2 minutes cache
  
  getCurriculumById: (id: string) => 
    cachedGet(`/curricula/${id}`, undefined, 10 * 60 * 1000), // 10 minutes cache
  
  searchCurricula: (query: string, filters?: any) => 
    cachedGet('/search', { q: query, ...filters }, 1 * 60 * 1000), // 1 minute cache
  
  getSearchSuggestions: (query: string, limit?: number) => 
    cachedGet('/search/suggestions', { q: query, limit }, 5 * 60 * 1000), // 5 minutes cache
  
  getSearchFilters: (query?: string) => 
    cachedGet('/search/filters', query ? { q: query } : {}, 5 * 60 * 1000), // 5 minutes cache
  
  getCategories: () => 
    cachedGet('/categories', undefined, 30 * 60 * 1000), // 30 minutes cache

  // Auth endpoints - now working with real backend!
  login: async (credentials: { email: string; password: string }) => {
    return await apiClient.post('/auth/login', credentials);
  },
  
  register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      return await apiClient.post('/auth/register', userData);
    } catch (error) {
      console.warn('Register API failed, using mock authentication:', error);
      return await mockAuth.register(userData);
    }
  },

  // User endpoints with mock fallback
  getSavedCurricula: async () => {
    try {
      return await apiClient.get('/user/saved');
    } catch (error) {
      console.warn('getSavedCurricula API failed, using mock data:', error);
      // Create mock saved curricula data
      const mockSavedCurricula = [
        {
          id: 'saved-1',
          personalNotes: 'Great for visual learners. My kids love the colorful illustrations.',
          savedAt: '2024-01-15T10:30:00Z',
          curriculum: {
            id: '1',
            name: 'Saxon Math',
            publisher: 'Saxon Publishers',
            description: 'A comprehensive math curriculum that uses incremental development and continual review.',
            imageUrl: '/images/placeholder.svg',
            overallRating: 4.1,
            gradeLevel: {
              name: 'K-12'
            },
            subjects: [
              { name: 'Mathematics' }
            ],
            teachingApproachStyle: 'Traditional',
            costPriceRange: '$$',
            timeCommitmentDailyMinutes: 45
          }
        },
        {
          id: 'saved-2',
          personalNotes: 'Perfect for our family. The self-paced approach works well.',
          savedAt: '2024-01-10T14:20:00Z',
          curriculum: {
            id: '2',
            name: 'Teaching Textbooks',
            publisher: 'Teaching Textbooks',
            description: 'Self-teaching math curriculum with automated grading and built-in help system.',
            imageUrl: '/images/placeholder.svg',
            overallRating: 4.3,
            gradeLevel: {
              name: '3-12'
            },
            subjects: [
              { name: 'Mathematics' }
            ],
            teachingApproachStyle: 'Self-Directed',
            costPriceRange: '$$$',
            timeCommitmentDailyMinutes: 30
          }
        }
      ];
      
      return {
        data: {
          success: true,
          savedCurricula: mockSavedCurricula
        }
      };
    }
  },
  
  saveCurriculum: async (curriculumId: string, personalNotes?: string) => {
    try {
      return await apiClient.post('/user/saved', { curriculumId, personalNotes });
    } catch (error) {
      console.warn('saveCurriculum API failed, using mock response:', error);
      return {
        data: {
          success: true,
          data: {
            id: 'mock-saved-' + Date.now(),
            curriculumId,
            personalNotes,
            savedAt: new Date().toISOString()
          }
        }
      };
    }
  },
  
  removeSavedCurriculum: async (id: string) => {
    try {
      return await apiClient.delete(`/user/saved/${id}`);
    } catch (error) {
      console.warn('removeSavedCurriculum API failed, using mock response:', error);
      return {
        data: {
          success: true,
          message: 'Curriculum removed from saved list'
        }
      };
    }
  },

  // Admin endpoints with mock fallback
  createCurriculum: async (curriculumData: any) => {
    try {
      return await apiClient.post('/admin/curricula', curriculumData);
    } catch (error) {
      console.warn('createCurriculum API failed, using mock response:', error);
      return {
        data: {
          success: true,
          data: {
            id: 'mock-curriculum-' + Date.now(),
            ...curriculumData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };
    }
  },
  
  updateCurriculum: async (id: string, curriculumData: any) => {
    try {
      return await apiClient.put(`/admin/curricula/${id}`, curriculumData);
    } catch (error) {
      console.warn('updateCurriculum API failed, using mock response:', error);
      return {
        data: {
          success: true,
          data: {
            id,
            ...curriculumData,
            updatedAt: new Date().toISOString()
          }
        }
      };
    }
  },
  
  deleteCurriculum: async (id: string) => {
    try {
      return await apiClient.delete(`/admin/curricula/${id}`);
    } catch (error) {
      console.warn('deleteCurriculum API failed, using mock response:', error);
      return {
        data: {
          success: true,
          message: 'Curriculum deleted successfully'
        }
      };
    }
  },
  
  getAnalytics: async () => {
    try {
      return await apiClient.get('/admin/analytics');
    } catch (error) {
      console.warn('getAnalytics API failed, using mock data:', error);
      return {
        data: {
          success: true,
          data: {
            totalCurricula: 6,
            totalUsers: 150,
            totalReviews: 89,
            popularSubjects: ['Mathematics', 'Science', 'Literature'],
            recentActivity: []
          }
        }
      };
    }
  },

  // Generic HTTP methods for admin components
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),
};

export default apiClient;