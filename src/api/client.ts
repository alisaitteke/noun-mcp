/**
 * The Noun Project API Client
 * 
 * Provides access to all Noun Project API endpoints.
 * Includes rate limiting and error handling.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { getOAuthHeaders } from './auth.js';
import { optimizeLimit, shouldIncludeSvg, isFreeTier } from '../utils/costOptimizer.js';

/**
 * Base URL for The Noun Project API
 */
const API_BASE_URL = 'https://api.thenounproject.com/v2';

/**
 * Rate limiter - 100 requests per minute
 * The Noun Project API enforces rate limiting
 */
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 600, // 100 requests/min = 600ms between requests
});

/**
 * Axios instance with base configuration
 */
let axiosInstance: AxiosInstance | null = null;

/**
 * Initialize the API client
 */
export function initializeClient(): void {
  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Request interceptor - Add OAuth headers
  axiosInstance.interceptors.request.use(
    (config) => {
      const fullUrl = `${API_BASE_URL}${config.url}`;
      const method = config.method?.toUpperCase() || 'GET';
      
      const oauthHeaders = getOAuthHeaders(fullUrl, method);
      config.headers.Authorization = oauthHeaders.Authorization;
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        
        if (status === 401) {
          throw new Error(
            'Authentication failed. Please check your NOUN_CONSUMER_KEY and NOUN_CONSUMER_SECRET.\n' +
            'Visit https://thenounproject.com/developers/apps/ to verify your credentials.'
          );
        } else if (status === 404) {
          throw new Error(`Resource not found: ${error.config?.url}`);
        } else if (status === 429) {
          throw new Error(
            'Rate limit exceeded. Please wait a moment before making more requests.'
          );
        } else {
          throw new Error(
            `API error (${status}): ${data?.message || error.message}`
          );
        }
      } else if (error.request) {
        throw new Error(
          'No response from The Noun Project API. Please check your internet connection.'
        );
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  );
}

/**
 * Rate-limited request wrapper
 */
async function makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  if (!axiosInstance) {
    throw new Error('API client is not initialized. Please call initializeClient() first.');
  }
  
  return limiter.schedule(requestFn);
}

/**
 * Search for icons
 * 
 * @param query - Search term (required)
 * @param options - Search filters
 * @returns Search results with icons
 */
export async function searchIcons(
  query: string,
  options: {
    styles?: 'solid' | 'line' | 'solid,line';
    line_weight?: number | string;
    limit_to_public_domain?: 0 | 1;
    thumbnail_size?: 42 | 84 | 200;
    include_svg?: 0 | 1;
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  return makeRequest(async () => {
    const params = new URLSearchParams({ query });
    
    if (options.styles) params.append('styles', options.styles);
    if (options.line_weight !== undefined) params.append('line_weight', String(options.line_weight));
    if (options.limit_to_public_domain !== undefined) params.append('limit_to_public_domain', String(options.limit_to_public_domain));
    
    // Cost optimization: use smaller thumbnail in FREE tier
    const thumbnailSize = options.thumbnail_size || (isFreeTier() ? 42 : 84);
    params.append('thumbnail_size', String(thumbnailSize));
    
    // Cost optimization: optimize SVG inclusion
    const includeSvg = options.include_svg !== undefined 
      ? options.include_svg 
      : (shouldIncludeSvg() ? 1 : 0);
    params.append('include_svg', String(includeSvg));
    
    // Cost optimization: apply limit optimization
    const optimizedLimit = optimizeLimit(options.limit, 20);
    params.append('limit', String(optimizedLimit));
    
    if (options.next_page) params.append('next_page', options.next_page);
    if (options.prev_page) params.append('prev_page', options.prev_page);
    
    const response = await axiosInstance!.get(`/icon?${params.toString()}`);
    return response.data;
  });
}

/**
 * Get a single icon by ID
 * 
 * @param iconId - Icon ID
 * @param thumbnailSize - Thumbnail size (42, 84, or 200)
 * @returns Icon details
 */
export async function getIcon(iconId: number, thumbnailSize?: 42 | 84 | 200) {
  return makeRequest(async () => {
    const params = new URLSearchParams();
    if (thumbnailSize) params.append('thumbnail_size', String(thumbnailSize));
    
    const queryString = params.toString();
    const url = queryString ? `/icon/${iconId}?${queryString}` : `/icon/${iconId}`;
    
    const response = await axiosInstance!.get(url);
    return response.data;
  });
}

/**
 * Download an icon with custom color and format
 * 
 * @param iconId - Icon ID
 * @param options - Download options (format, color, size)
 * @returns Base64 encoded icon file
 */
export async function downloadIcon(
  iconId: number,
  options: {
    color?: string;
    filetype?: 'svg' | 'png';
    size?: number;
  } = {}
) {
  return makeRequest(async () => {
    const params = new URLSearchParams();
    
    if (options.color) params.append('color', options.color);
    if (options.filetype) params.append('filetype', options.filetype);
    if (options.size && options.filetype === 'png') {
      params.append('size', String(options.size));
    }
    
    const queryString = params.toString();
    const url = queryString ? `/icon/${iconId}/download?${queryString}` : `/icon/${iconId}/download`;
    
    const response = await axiosInstance!.get(url);
    return response.data;
  });
}

/**
 * Search for collections
 * 
 * @param query - Search term
 * @param options - Search options
 * @returns Collection search results
 */
export async function searchCollections(
  query: string,
  options: {
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  return makeRequest(async () => {
    const params = new URLSearchParams({ query });
    
    // Cost optimization: apply limit optimization
    const optimizedLimit = optimizeLimit(options.limit, 10);
    params.append('limit', String(optimizedLimit));
    
    if (options.next_page) params.append('next_page', options.next_page);
    if (options.prev_page) params.append('prev_page', options.prev_page);
    
    const response = await axiosInstance!.get(`/collection?${params.toString()}`);
    return response.data;
  });
}

/**
 * Get a single collection by ID
 * 
 * @param collectionId - Collection ID
 * @param options - Options (thumbnail size, pagination)
 * @returns Collection details with icons
 */
export async function getCollection(
  collectionId: number,
  options: {
    thumbnail_size?: 42 | 84 | 200;
    include_svg?: 0 | 1;
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  return makeRequest(async () => {
    const params = new URLSearchParams();
    
    // Cost optimization: use smaller thumbnail in FREE tier
    const thumbnailSize = options.thumbnail_size || (isFreeTier() ? 42 : 84);
    params.append('thumbnail_size', String(thumbnailSize));
    
    // Cost optimization: optimize SVG inclusion
    const includeSvg = options.include_svg !== undefined 
      ? options.include_svg 
      : (shouldIncludeSvg() ? 1 : 0);
    params.append('include_svg', String(includeSvg));
    
    // Cost optimization: apply limit optimization
    const optimizedLimit = optimizeLimit(options.limit, 10);
    params.append('limit', String(optimizedLimit));
    
    if (options.next_page) params.append('next_page', options.next_page);
    if (options.prev_page) params.append('prev_page', options.prev_page);
    
    const queryString = params.toString();
    const url = queryString ? `/collection/${collectionId}?${queryString}` : `/collection/${collectionId}`;
    
    const response = await axiosInstance!.get(url);
    return response.data;
  });
}

/**
 * Get autocomplete suggestions for icon search
 * 
 * @param query - Search term
 * @param limit - Maximum number of suggestions (max 10)
 * @returns Autocomplete suggestions
 */
export async function iconAutocomplete(query: string, limit: number = 10) {
  return makeRequest(async () => {
    const params = new URLSearchParams({ query });
    params.append('limit', String(Math.min(limit, 10)));
    
    const response = await axiosInstance!.get(`/icon/autocomplete?${params.toString()}`);
    return response.data;
  });
}

/**
 * Check API usage limits
 * 
 * @returns Usage information (monthly limit and current usage)
 */
export async function checkUsage() {
  return makeRequest(async () => {
    const response = await axiosInstance!.get('/client/usage');
    return response.data;
  });
}
