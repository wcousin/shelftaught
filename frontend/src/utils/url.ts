// URL utilities for SEO-friendly URLs

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const createCurriculumUrl = (id: string, _name?: string, _publisher?: string): string => {
  // Temporarily reverted to simple ID-based URLs until slug functionality is re-implemented
  return `/curriculum/${id}`;
  
  // TODO: Re-enable SEO-friendly URLs after backend slug support is restored
  // const nameSlug = createSlug(name);
  // const publisherSlug = publisher ? createSlug(publisher) : '';
  // const fullSlug = publisherSlug 
  //   ? `${nameSlug}-by-${publisherSlug}`
  //   : nameSlug;
  // return `/curriculum/${id}/${fullSlug}`;
};

export const createSearchUrl = (query: string, filters?: Record<string, any>): string => {
  const params = new URLSearchParams();
  
  if (query) {
    params.set('q', query);
  }
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value.toString());
        }
      }
    });
  }
  
  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : '/search';
};

export const createBrowseUrl = (category?: string, grade?: string): string => {
  const params = new URLSearchParams();
  
  if (category) {
    params.set('category', category);
  }
  
  if (grade) {
    params.set('grade', grade);
  }
  
  const queryString = params.toString();
  return queryString ? `/browse?${queryString}` : '/browse';
};

export const getCanonicalUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://shelftaught.com';
  return `${baseUrl}${path}`;
};

export const extractIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/curriculum\/([^\/]+)/);
  return match ? match[1] : null;
};

// Validate and clean URLs
export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};

export const normalizeUrl = (url: string): string => {
  return url
    .toLowerCase()
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/^\//, ''); // Remove leading slash for relative URLs
};