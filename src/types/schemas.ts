/**
 * Zod Schemas and Type Definitions
 * 
 * Strict type validation for all MCP tool inputs and outputs
 */

import { z } from 'zod';

/**
 * Icon search tool input schema
 */
export const SearchIconsInputSchema = z.object({
  query: z.string().min(1).describe('Search term (e.g., "dog", "house", "bicycle")'),
  styles: z.enum(['solid', 'line', 'solid,line']).optional().describe('Icon style filter'),
  line_weight: z.union([z.number().min(1).max(60), z.string()]).optional().describe('Line weight (1-60) or range (e.g., "18-20")'),
  limit_to_public_domain: z.union([z.literal(0), z.literal(1)]).optional().describe('Show only public domain icons (1) or all (0)'),
  thumbnail_size: z.union([z.literal(42), z.literal(84), z.literal(200)]).optional().describe('Thumbnail size (pixels)'),
  include_svg: z.union([z.literal(0), z.literal(1)]).optional().describe('Include SVG URLs (1) or not (0)'),
  limit: z.number().min(1).max(100).optional().describe('Maximum number of results'),
  next_page: z.string().optional().describe('Pagination token for next page'),
  prev_page: z.string().optional().describe('Pagination token for previous page'),
});

export type SearchIconsInput = z.infer<typeof SearchIconsInputSchema>;

/**
 * Icon details tool input schema
 */
export const GetIconInputSchema = z.object({
  icon_id: z.number().int().positive().describe('Unique icon ID'),
  thumbnail_size: z.union([z.literal(42), z.literal(84), z.literal(200)]).optional().describe('Thumbnail size (pixels)'),
});

export type GetIconInput = z.infer<typeof GetIconInputSchema>;

/**
 * Icon download tool input schema
 */
export const DownloadIconInputSchema = z.object({
  icon_id: z.number().int().positive().describe('ID of the icon to download'),
  color: z.string().regex(/^[0-9A-Fa-f]{6}$/).optional().describe('Hex color code (e.g., "FF0000" for red)'),
  filetype: z.enum(['svg', 'png']).optional().default('svg').describe('File format'),
  size: z.number().min(20).max(1200).optional().describe('Size for PNG (pixels). Not applicable for SVG'),
  save_to_file: z.string().optional().describe('File path to save the icon (optional)'),
});

export type DownloadIconInput = z.infer<typeof DownloadIconInputSchema>;

/**
 * Collection search tool input schema
 */
export const SearchCollectionsInputSchema = z.object({
  query: z.string().min(1).describe('Collection search term'),
  limit: z.number().min(1).max(100).optional().describe('Maximum number of results'),
  next_page: z.string().optional().describe('Pagination token for next page'),
  prev_page: z.string().optional().describe('Pagination token for previous page'),
});

export type SearchCollectionsInput = z.infer<typeof SearchCollectionsInputSchema>;

/**
 * Collection details tool input schema
 */
export const GetCollectionInputSchema = z.object({
  collection_id: z.number().int().positive().describe('Unique collection ID'),
  thumbnail_size: z.union([z.literal(42), z.literal(84), z.literal(200)]).optional().describe('Thumbnail size (pixels)'),
  include_svg: z.union([z.literal(0), z.literal(1)]).optional().describe('Include SVG URLs'),
  limit: z.number().min(1).max(100).optional().describe('Icon limit in collection'),
  next_page: z.string().optional().describe('Pagination token for next page'),
  prev_page: z.string().optional().describe('Pagination token for previous page'),
});

export type GetCollectionInput = z.infer<typeof GetCollectionInputSchema>;

/**
 * Autocomplete tool input schema
 */
export const IconAutocompleteInputSchema = z.object({
  query: z.string().min(1).describe('Search term for autocomplete'),
  limit: z.number().min(1).max(10).optional().default(10).describe('Number of suggestions (maximum 10)'),
});

export type IconAutocompleteInput = z.infer<typeof IconAutocompleteInputSchema>;

/**
 * API usage check input schema (no parameters)
 */
export const CheckUsageInputSchema = z.object({});

export type CheckUsageInput = z.infer<typeof CheckUsageInputSchema>;

/**
 * Common response types
 */

export interface IconCreator {
  name: string;
  username: string;
  permalink: string;
}

export interface IconStyle {
  style: 'solid' | 'line';
  line_weight?: number;
}

export interface IconCollection {
  id: string;
  name: string;
  permalink: string;
  creator: IconCreator;
}

export interface Icon {
  id: string;
  term: string;
  permalink: string;
  thumbnail_url?: string;
  icon_url?: string;
  tags: string[];
  attribution: string;
  license_description: string;
  creator: IconCreator;
  styles: IconStyle[];
  collections: IconCollection[];
}

export interface LegacyUsageWindow {
  limit?: number;
  usage?: number;
}

export interface QuotaUsageWindow {
  service_calls_used?: number;
  service_calls_limit?: number;
  icon_calls_used?: number;
  icon_calls_limit?: number;
  period_start?: string;
  period_end?: string;
  limit?: number;
  usage?: number;
}

export interface UsageLimits {
  hourly?: QuotaUsageWindow;
  daily?: QuotaUsageWindow;
  monthly?: QuotaUsageWindow & LegacyUsageWindow;
}

export interface UsageWindows {
  hourly?: QuotaUsageWindow;
  daily?: QuotaUsageWindow;
  monthly?: QuotaUsageWindow;
}

export interface SearchIconsResponse {
  generated_at: string;
  icons: Icon[];
  total: number;
  next_page?: string;
  prev_page?: string;
  usage_limits?: UsageLimits;
}

export interface GetIconResponse {
  generated_at: string;
  icon: Icon;
  total: number;
  usage_limits?: UsageLimits;
}

export interface DownloadIconResponse {
  base64_encoded_file: string;
  content_type: string;
  usage_limits?: UsageLimits;
}

export interface Collection {
  id: string;
  name: string;
  permalink: string;
  creator: IconCreator;
  icon_count: number;
  tags: string[];
  icons?: Icon[];
  next_page?: string;
  prev_page?: string;
}

export interface SearchCollectionsResponse {
  generated_at: string;
  collections: Collection[];
  total: number;
  next_page?: string;
  prev_page?: string;
  usage_limits?: UsageLimits;
}

export interface GetCollectionResponse {
  generated_at: string;
  collection: Collection;
  total: number;
  usage_limits?: UsageLimits;
}

export interface IconAutocompleteResponse {
  generated_at: string;
  suggestions: string[];
  usage_limits?: UsageLimits;
}

export interface CheckUsageResponse {
  monthly?: LegacyUsageWindow;
  usage?: UsageWindows;
  generated_at?: string;
  usage_limits?: UsageLimits;
}
