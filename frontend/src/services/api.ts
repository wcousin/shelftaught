import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { cache } from '../utils/cache';
import { measureAsync } from '../utils/performance';

// API Configuration - Force production API when on Railway
const isOnRailway = window.location.hostname.includes('railway.app') || 
                   window.location.hostname.includes('frontend-new-production-96a4.up.railway.app');
const API_BASE_URL = isOnRailway 
  ? 'https://shelftaught-production.up.railway.app/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Debug logging
console.log('🔧 API Configuration Debug:');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- PROD mode:', import.meta.env.PROD);
console.log('- Hostname:', window.location.hostname);
console.log('- Is on Railway:', isOnRailway);
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

// Helper function for cached GET requests - NO MOCK FALLBACKS
const cachedGet = async (endpoint: string, params?: any, ttl?: number): Promise<AxiosResponse> => {
  const cacheKey = createCacheKey(endpoint, params);
  
  // Check cache first
  const cachedData = cache.get<AxiosResponse>(cacheKey);
  if (cachedData) {
    return Promise.resolve(cachedData);
  }
  
  // Add cache-busting parameter for first-time loads
  const requestParams = { ...params };
  if (!cachedData) {
    requestParams._cb = CACHE_BUSTER;
  }
  
  // Make API request with performance monitoring
  const response = await measureAsync(
    `api-${endpoint.replace(/\//g, '-')}`,
    () => apiClient.get(endpoint, { params: requestParams })
  );
  
  // Cache the response (default 5 minutes, longer for static data)
  cache.set(cacheKey, response, ttl);
  
  return response;
};

// Clear any existing cache on startup to prevent stale mock data
cache.clear();
console.log('🧹 Cleared API cache to prevent stale data');

// Add cache-busting parameter for initial load
const CACHE_BUSTER = Date.now();

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

  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    return await apiClient.post('/auth/login', credentials);
  },
  
  register: async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    return await apiClient.post('/auth/register', userData);
  },

  // User endpoints
  getSavedCurricula: async () => {
    return await apiClient.get('/user/saved');
  },
  
  saveCurriculum: async (curriculumId: string, personalNotes?: string) => {
    return await apiClient.post('/user/saved', { curriculumId, personalNotes });
  },
  
  removeSavedCurriculum: async (id: string) => {
    return await apiClient.delete(`/user/saved/${id}`);
  },

  // Admin endpoints
  createCurriculum: async (curriculumData: any) => {
    return await apiClient.post('/admin/curricula', curriculumData);
  },
  
  updateCurriculum: async (id: string, curriculumData: any) => {
    return await apiClient.put(`/admin/curricula/${id}`, curriculumData);
  },
  
  deleteCurriculum: async (id: string) => {
    return await apiClient.delete(`/admin/curricula/${id}`);
  },
  
  getAnalytics: async () => {
    return await apiClient.get('/admin/analytics');
  },

  // Generic HTTP methods for admin components
  get: (url: string, config?: any) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: any) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: any) => apiClient.put(url, data, config),
  delete: (url: string, config?: any) => apiClient.delete(url, config),

  // Cache management
  clearCache: () => {
    cache.clear();
    console.log('🧹 API cache cleared');
  },
};

export default apiClient;